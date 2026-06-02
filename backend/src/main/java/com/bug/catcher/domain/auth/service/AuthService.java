package com.bug.catcher.domain.auth.service;

import com.bug.catcher.domain.auth.dto.LoginRequestDto;
import com.bug.catcher.domain.auth.dto.TokenResponseDto;
import com.bug.catcher.domain.auth.repository.RefreshTokenRepository;
import com.bug.catcher.domain.entity.RefreshToken;
import com.bug.catcher.domain.entity.User;
import com.bug.catcher.domain.user.repository.UserRepository;
import com.bug.catcher.global.auth.CustomUserPrincipal;
import com.bug.catcher.global.auth.JwtProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * JWT 발급/회전/폐기 흐름.
 *
 * 토큰 저장 정책:
 *  - access: 메모리(프론트 Zustand), 만료 15분.
 *  - refresh: HttpOnly Secure SameSite=Lax 쿠키, 만료 7일. DB에 hash 저장(rotation).
 *  - userId당 RefreshToken row 1개 강제 — 다른 디바이스 로그인 시 자동 로그아웃.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    /**
     * 쿠키 Path를 /api/auth로 한정.
     * → refresh/logout 호출 시에만 쿠키 자동 전송. 다른 /api/** 호출엔 안 실림 →
     *   서버 트래픽 절약 + CSRF 노출면 축소.
     */
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public TokenResponseDto login(LoginRequestDto requestDto, HttpServletResponse response) {
        Authentication authentication = authenticate(requestDto);
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        String accessToken = jwtProvider.createAccessToken(principal.getUserId(), principal.getRole());
        String rawRefresh = jwtProvider.createRefreshToken();

        upsertRefreshToken(principal.getUserId(), rawRefresh);
        writeRefreshCookie(response, rawRefresh, jwtProvider.getRefreshTtlMs());

        return new TokenResponseDto(accessToken);
    }

    /**
     * refresh 쿠키 검증 → 새 access + refresh rotation.
     */
    @Transactional
    public TokenResponseDto refresh(HttpServletRequest request, HttpServletResponse response) {
        String rawRefresh = readRefreshCookie(request)
                .orElseThrow(() -> new IllegalArgumentException("리프레시 토큰이 없습니다."));

        String hash = jwtProvider.hashRefreshToken(rawRefresh);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다."));

        if (stored.isExpired()) {
            // 만료 — row 삭제 + 쿠키 만료. 사용자는 재로그인.
            refreshTokenRepository.delete(stored);
            clearRefreshCookie(response);
            throw new IllegalArgumentException("리프레시 토큰이 만료되었습니다.");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // rotation — 새 refresh로 갱신
        String newRawRefresh = jwtProvider.createRefreshToken();
        stored.rotate(
                jwtProvider.hashRefreshToken(newRawRefresh),
                LocalDateTime.now().plusNanos(jwtProvider.getRefreshTtlMs() * 1_000_000));
        writeRefreshCookie(response, newRawRefresh, jwtProvider.getRefreshTtlMs());

        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getRole());
        return new TokenResponseDto(accessToken);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        // 쿠키가 있으면 그 hash로 row 삭제. 없으면 쿠키만 만료시키고 종료(이미 로그아웃 상태).
        readRefreshCookie(request).ifPresent(rawRefresh -> {
            String hash = jwtProvider.hashRefreshToken(rawRefresh);
            refreshTokenRepository.findByTokenHash(hash)
                    .ifPresent(refreshTokenRepository::delete);
        });
        clearRefreshCookie(response);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMyInfo(CustomUserPrincipal principal) {
        // stateless principal엔 nickname이 없으므로 DB에서 1회 조회.
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return Map.of(
                "userId", user.getId(),
                "nickname", user.getNickname(),
                "role", user.getRole()
        );
    }

    /* ───────────── 내부 헬퍼 ───────────── */

    private Authentication authenticate(LoginRequestDto requestDto) {
        try {
            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
            );
        } catch (DisabledException e) {
            throw new IllegalArgumentException(e.getMessage());
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 일치하지 않습니다.");
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("로그인에 실패했습니다.");
        }
    }

    private void upsertRefreshToken(Long userId, String rawRefresh) {
        String hash = jwtProvider.hashRefreshToken(rawRefresh);
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusNanos(jwtProvider.getRefreshTtlMs() * 1_000_000);
        refreshTokenRepository.findByUserId(userId).ifPresentOrElse(
                existing -> existing.rotate(hash, expiresAt),
                () -> refreshTokenRepository.save(
                        RefreshToken.builder()
                                .userId(userId)
                                .tokenHash(hash)
                                .expiresAt(expiresAt)
                                .build()
                )
        );
    }

    private Optional<String> readRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return Optional.empty();
        for (Cookie cookie : request.getCookies()) {
            if (REFRESH_COOKIE_NAME.equals(cookie.getName())) {
                return Optional.ofNullable(cookie.getValue()).filter(v -> !v.isBlank());
            }
        }
        return Optional.empty();
    }

    private void writeRefreshCookie(HttpServletResponse response, String value, long ttlMs) {
        // jakarta.servlet.http.Cookie는 SameSite 미지원이라 헤더 직접 작성.
        // dev(HTTP)에서도 SameSite=Lax + Secure 누락으로 브라우저에 저장 가능.
        // 운영 HTTPS에선 반드시 Secure 추가 필요 — 환경 분기는 차후 PR.
        String cookie = REFRESH_COOKIE_NAME + "=" + value
                + "; Path=" + REFRESH_COOKIE_PATH
                + "; Max-Age=" + (ttlMs / 1000)
                + "; HttpOnly"
                + "; SameSite=Lax";
        response.addHeader("Set-Cookie", cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        String cookie = REFRESH_COOKIE_NAME + "="
                + "; Path=" + REFRESH_COOKIE_PATH
                + "; Max-Age=0"
                + "; HttpOnly"
                + "; SameSite=Lax";
        response.addHeader("Set-Cookie", cookie);
    }
}

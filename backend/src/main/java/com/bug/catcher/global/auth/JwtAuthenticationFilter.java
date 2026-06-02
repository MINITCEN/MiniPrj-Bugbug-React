package com.bug.catcher.global.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Authorization: Bearer <access> 헤더를 보고 SecurityContext에 인증을 채워넣는다.
 *
 * - 토큰 없으면: 익명으로 체인 진행 (public endpoint가 동작해야 하므로 401 강제 X).
 * - 토큰 있고 유효: claims만으로 CustomUserPrincipal.stateless 구성 — DB 조회 0.
 * - 토큰 있고 무효/만료: SecurityContext clear 후 진행 → 보호 경로면 entry point가 401 응답.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String token = resolveToken(request);
        if (token != null) {
            try {
                Claims claims = jwtProvider.parseAccessToken(token);
                Long userId = Long.parseLong(claims.getSubject());
                String role = claims.get("role", String.class);

                CustomUserPrincipal principal = CustomUserPrincipal.stateless(userId, role);
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException | IllegalArgumentException e) {
                // 만료/서명 실패/형식 오류 — 익명으로 진행, 보호 경로면 entry point에서 401 처리.
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(AUTH_HEADER);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            return null;
        }
        return header.substring(BEARER_PREFIX.length()).trim();
    }
}

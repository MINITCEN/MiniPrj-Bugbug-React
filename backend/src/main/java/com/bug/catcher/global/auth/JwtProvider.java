package com.bug.catcher.global.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * JWT 발급/검증 + refresh hash 생성기.
 *
 * - access: sub=userId, claim "role"=ROLE_*, HS256 서명. axios Authorization 헤더로 운반.
 * - refresh: 랜덤 UUID(JWT 아님). HttpOnly 쿠키로 운반, 서버 DB에는 SHA-256 hash로 저장.
 *   refresh를 굳이 JWT로 만들지 않은 이유: 어차피 DB hit으로 검증하므로 자체 클레임 불필요,
 *   짧고 단순한 랜덤 문자열이 디버깅 편함.
 */
@Component
public class JwtProvider {

    private final SecretKey signingKey;
    private final long accessTtlMs;
    private final long refreshTtlMs;

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-ttl-min}") long accessTtlMin,
            @Value("${jwt.refresh-ttl-days}") long refreshTtlDays
    ) {
        // HS256 요구치인 32B 이상 보장. base64 디코딩이 가능하면 사용, 실패하면 raw bytes.
        byte[] keyBytes = decodeSecret(secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTtlMs = Duration.ofMinutes(accessTtlMin).toMillis();
        this.refreshTtlMs = Duration.ofDays(refreshTtlDays).toMillis();
    }

    public String createAccessToken(Long userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessTtlMs)))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    /** 랜덤 refresh 토큰. UUID 두 개를 합쳐 충돌 가능성을 낮춤. */
    public String createRefreshToken() {
        return UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
    }

    public long getRefreshTtlMs() {
        return refreshTtlMs;
    }

    /**
     * access 토큰을 파싱·검증해 Claims 반환.
     * 만료/서명 실패 등은 JwtException 계열로 던져진다 (필터에서 catch).
     */
    public Claims parseAccessToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** refresh raw 값의 SHA-256 hash (base64). DB 저장용. */
    public String hashRefreshToken(String rawRefresh) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawRefresh.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256은 JDK 표준 알고리즘이라 실제로는 발생하지 않음.
            throw new IllegalStateException("SHA-256 알고리즘을 사용할 수 없습니다.", e);
        }
    }

    private byte[] decodeSecret(String secret) {
        // .env에 openssl base64 결과를 그대로 넣었을 때를 우선 가정.
        try {
            byte[] decoded = Base64.getDecoder().decode(secret);
            if (decoded.length >= 32) {
                return decoded;
            }
        } catch (IllegalArgumentException ignored) {
            // base64가 아니면 raw 문자열로 처리.
        }
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET은 base64 디코딩 결과 또는 raw 길이 32바이트(=256비트) 이상이어야 합니다.");
        }
        return raw;
    }
}

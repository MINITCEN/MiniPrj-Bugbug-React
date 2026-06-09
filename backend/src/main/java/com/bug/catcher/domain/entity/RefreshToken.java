package com.bug.catcher.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

/**
 * 사용자 1명당 refresh 토큰 1행 강제 (단일 세션 정책).
 *
 * - userId UNIQUE 제약으로 한 사용자가 동시에 여러 디바이스에서 로그인 못 함.
 *   새 로그인 시 기존 row를 upsert(덮어쓰기)하므로 이전 디바이스는 다음 access 만료에서
 *   refresh 실패 → 자동 로그아웃.
 * - tokenHash: 쿠키로 내려간 raw 값의 SHA-256 (base64). DB 유출 시에도 raw 토큰 안 노출.
 * - 강제 로그아웃(자격 해제 등)은 deleteByUserId 한 줄로 처리.
 * - 만료 청소는 별도 스케줄러에서 처리.
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "refresh_tokens", indexes = @Index(columnList = "userId"))
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_token_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, length = 128)
    private String tokenHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder
    private RefreshToken(Long userId, String tokenHash, LocalDateTime expiresAt) {
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
    }

    /** rotation 시 기존 row의 hash/expiresAt 갱신. */
    public void rotate(String newHash, LocalDateTime newExpiresAt) {
        this.tokenHash = newHash;
        this.expiresAt = newExpiresAt;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}

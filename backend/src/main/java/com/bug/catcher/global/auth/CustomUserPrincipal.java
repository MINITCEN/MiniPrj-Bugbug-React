package com.bug.catcher.global.auth;

import com.bug.catcher.domain.entity.User;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class CustomUserPrincipal implements UserDetails {

    private final Long userId;
    private final String email;
    private final String password;
    private final String nickname;
    private final String role;
    private final List<GrantedAuthority> authorities;

    public CustomUserPrincipal(User user) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.nickname = user.getNickname();
        this.role = user.getRole();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    private CustomUserPrincipal(Long userId, String email, String password, String nickname, String role) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    /**
     * JWT 인증 필터 전용 정적 팩토리.
     *
     * access token claims만으로 Principal을 재구성한다 (DB 조회 0건 — stateless 핵심).
     * email/password/nickname은 토큰에 담지 않으므로 null. nickname/email이 필요한
     * 호출부(/auth/me 등)는 userId로 별도 조회한다.
     */
    public static CustomUserPrincipal stateless(Long userId, String role) {
        return new CustomUserPrincipal(userId, null, null, null, role);
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getNickname() {
        return nickname;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }
}

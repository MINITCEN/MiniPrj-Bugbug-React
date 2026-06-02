package com.bug.catcher.global.config;

import com.bug.catcher.global.auth.JwtAuthenticationFilter;
import com.bug.catcher.global.auth.JwtProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtProvider jwtProvider) {
        return new JwtAuthenticationFilter(jwtProvider);
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                // JWT stateless — 세션 생성 자체를 막아 JSESSIONID 의존 0.
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                response.setContentType("text/plain;charset=UTF-8");
                                response.getWriter().write("로그인이 필요한 서비스입니다.");
                            } else {
                                response.sendRedirect("/login");
                            }
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType("text/plain;charset=UTF-8");
                                response.getWriter().write("접근 권한이 없습니다.");
                            } else {
                                response.sendRedirect("/login");
                            }
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/login",
                                "/signup",
                                "/api/users/signup",
                                "/api/users/check-email",
                                "/api/users/check-nickname",
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/mosquito-map",
                                "/css/**",
                                "/js/**",
                                "/image/**",
                                "/map/**",
                                "/uploads/**",
                                "/h2-console/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/error",
                                "/service-intro",
                                "/ws/chats/**",
                                // Thymeleaf 잔재 페이지들 — 본 라운드는 API만 JWT로 보호.
                                // 페이지 자체는 별도 이슈에서 React로 마이그레이션 + 컨트롤러 삭제 예정.
                                "/mypage/**",
                                "/admin/**",
                                "/hunter/**",
                                "/requestView/**",
                                "/requestForm/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/requestView/**",
                                "/api/main/stats",
                                "/api/request/wholeList",
                                "/api/hunters",
                                "/api/hunters/*/profile",
                                "/api/hunters/*/reviews",
                                "/api/requests/*/comments",
                                "/api/requests/*/comments/*/replies",
                                "/api/v1/mosquito/**"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

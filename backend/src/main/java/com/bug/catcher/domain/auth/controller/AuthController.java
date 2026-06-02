package com.bug.catcher.domain.auth.controller;

import com.bug.catcher.domain.auth.dto.LoginRequestDto;
import com.bug.catcher.domain.auth.dto.TokenResponseDto;
import com.bug.catcher.domain.auth.service.AuthService;
import com.bug.catcher.global.auth.CustomUserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(
            @RequestBody LoginRequestDto requestDto,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(requestDto, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.refresh(request, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(authService.getMyInfo(principal));
    }
}

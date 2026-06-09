package com.bug.catcher.domain.user.controller;

import com.bug.catcher.domain.user.dto.SignupRequestDto;
import com.bug.catcher.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequestDto requestDto) {
        userService.signup(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입이 성공적으로 완료되었습니다.");
    }

    @GetMapping("/check-email")
    public ResponseEntity<java.util.Map<String, Boolean>> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(java.util.Map.of("available", userService.isEmailAvailable(email)));
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<java.util.Map<String, Boolean>> checkNickname(@RequestParam String nickname) {
        return ResponseEntity.ok(java.util.Map.of("available", userService.isNicknameAvailable(nickname)));
    }
}
package com.bug.catcher.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 로그인/리프레시 응답 body.
 *
 * access token만 body에 담아 프론트가 JS 메모리(Zustand)에 보관한다.
 * refresh는 별도로 Set-Cookie(HttpOnly)로 내려보내므로 body에 포함하지 않는다.
 */
@Getter
@AllArgsConstructor
public class TokenResponseDto {
    private String accessToken;
}

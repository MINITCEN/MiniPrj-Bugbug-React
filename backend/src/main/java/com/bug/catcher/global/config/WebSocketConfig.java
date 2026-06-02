package com.bug.catcher.global.config;

import com.bug.catcher.domain.chat.security.ChatRoomPermissionChecker;
import com.bug.catcher.global.auth.CustomUserPrincipal;
import com.bug.catcher.global.auth.JwtProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String CHAT_ROOM_TOPIC_PREFIX = "/topic/chat/room/";
    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final ChatRoomPermissionChecker chatRoomPermissionChecker;
    private final JwtProvider jwtProvider;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 프론트엔드에서 웹소켓 연결 시 사용할 엔드포인트 주소: ws://localhost:8080/ws/chats
        registry.addEndpoint("/ws/chats")
                .setAllowedOriginPatterns("*") // 실무에서는 특정 도메인만 허용하도록 변경 필요
                .withSockJS(); // 구형 브라우저 지원을 위해 SockJS 옵션 추가
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트(프론트)가 메시지를 보낼 때 (발신) 사용할 prefix
        registry.setApplicationDestinationPrefixes("/app");

        // 클라이언트(프론트)가 메시지를 받을 때 (수신/구독) 사용할 prefix
        registry.enableSimpleBroker("/topic");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                if (StompCommand.CONNECT == accessor.getCommand()) {
                    authenticateConnect(accessor);
                }

                if (StompCommand.SUBSCRIBE == accessor.getCommand()) {
                    validateSubscription(accessor);
                }

                return message;
            }
        });
    }

    /**
     * STOMP CONNECT frame의 Authorization 헤더에서 JWT를 꺼내 인증을 수립한다.
     *
     * 인증 결과는 accessor.setUser로 세션 단위 보관 → 이후 SUBSCRIBE/SEND에서
     * accessor.getUser() 호출로 그대로 동일 사용자 식별.
     *
     * 토큰이 없거나 무효하면 AccessDeniedException으로 CONNECT 자체 차단.
     * 기존 SUBSCRIBE 단계의 권한 체크는 변경 없음.
     */
    private void authenticateConnect(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader(AUTH_HEADER);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw new AccessDeniedException("STOMP 연결에 인증이 필요합니다.");
        }

        String token = header.substring(BEARER_PREFIX.length()).trim();
        Claims claims;
        try {
            claims = jwtProvider.parseAccessToken(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new AccessDeniedException("유효하지 않은 인증 토큰입니다.");
        }

        Long userId = Long.parseLong(claims.getSubject());
        String role = claims.get("role", String.class);
        CustomUserPrincipal principal = CustomUserPrincipal.stateless(userId, role);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());
        accessor.setUser(authentication);
    }

    private void validateSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();

        if (destination == null || !destination.startsWith(CHAT_ROOM_TOPIC_PREFIX)) {
            return;
        }

        CustomUserPrincipal loginUser = getLoginUser(accessor);
        Long roomId = parseRoomId(destination);

        if (!chatRoomPermissionChecker.isParticipant(roomId, loginUser.getUserId())) {
            throw new AccessDeniedException("채팅방 참여자만 구독할 수 있습니다.");
        }
    }

    private CustomUserPrincipal getLoginUser(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof Authentication authentication
                && authentication.getPrincipal() instanceof CustomUserPrincipal loginUser) {
            return loginUser;
        }
        throw new AccessDeniedException("로그인이 필요합니다.");
    }

    private Long parseRoomId(String destination) {
        String roomId = destination.substring(CHAT_ROOM_TOPIC_PREFIX.length());
        try {
            return Long.valueOf(roomId);
        } catch (NumberFormatException e) {
            throw new AccessDeniedException("올바르지 않은 채팅방 구독 요청입니다.");
        }
    }
}

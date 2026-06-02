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
    /**
     * WebSocket 세션 attributes 안에 인증 객체를 보관할 키.
     *
     * Spring은 매 inbound STOMP 메시지(SEND/SUBSCRIBE 등)마다
     * StompSubProtocolHandler.handleMessageFromClient에서 user를
     * session.getPrincipal()로 재설정한다. JWT는 HTTP 핸드셰이크 시점에
     * 인증 정보가 없으므로 session.getPrincipal()이 null → 후속 메시지에서
     * accessor.getUser()가 null이 되어버린다.
     *
     * 따라서 CONNECT 시점의 인증 객체를 세션 attributes에 저장해두고,
     * 후속 메시지의 preSend에서 user가 null이면 여기서 복원한다.
     */
    private static final String AUTH_ATTR = "jwt.auth";

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
                    Authentication auth = authenticateConnect(accessor);
                    accessor.setUser(auth);
                    // 후속 메시지를 위해 세션 attributes에도 저장
                    if (accessor.getSessionAttributes() != null) {
                        accessor.getSessionAttributes().put(AUTH_ATTR, auth);
                    }
                } else if (accessor.getUser() == null && accessor.getSessionAttributes() != null) {
                    // SEND/SUBSCRIBE 등 — Spring이 user를 null로 덮어쓴 상태.
                    // 세션 attributes에서 CONNECT 시점에 저장한 인증 객체로 복원.
                    Object stored = accessor.getSessionAttributes().get(AUTH_ATTR);
                    if (stored instanceof Authentication stashedAuth) {
                        accessor.setUser(stashedAuth);
                    }
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
     * 토큰이 없거나 무효하면 AccessDeniedException으로 CONNECT 자체 차단.
     */
    private Authentication authenticateConnect(StompHeaderAccessor accessor) {
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

        return new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());
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

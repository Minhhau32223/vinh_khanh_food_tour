package com.foodtour.api.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AdminWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = Collections.newSetFromMap(new ConcurrentHashMap<>());
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }

    public void broadcastOnlineDevices(int count, List<Map<String, Object>> devices) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "type", "online_count",
                    "count", count,
                    "devices", devices
            ));
            TextMessage textMessage = new TextMessage(payload);
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(textMessage);
                    } catch (IOException ignored) {
                        // Skip broken admin websocket sessions.
                    }
                }
            }
        } catch (Exception ignored) {
            // Ignore payload serialization errors.
        }
    }

    public void broadcastOnlineCount(int count) {
        broadcastOnlineDevices(count, List.of());
    }
}

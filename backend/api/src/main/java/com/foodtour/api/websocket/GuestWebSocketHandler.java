package com.foodtour.api.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class GuestWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> wsToDeviceId = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String wsId = session.getId();
        String tempDeviceId = "ws_" + wsId;
        String key = "online_device:" + tempDeviceId;
        redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(buildTempDevicePayload(tempDeviceId)), 90, TimeUnit.SECONDS);
        wsToDeviceId.put(wsId, tempDeviceId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String wsId = session.getId();
        try {
            JsonNode json = objectMapper.readTree(message.getPayload());
            String type = json.path("type").asText("");
            String deviceId = readNullableText(json, "deviceId");

            if (!"heartbeat".equals(type) || deviceId == null) {
                return;
            }

            String previousDeviceId = wsToDeviceId.get(wsId);
            if (previousDeviceId != null && !previousDeviceId.equals(deviceId)) {
                redisTemplate.delete("online_device:" + previousDeviceId);
            }

            String key = "online_device:" + deviceId;
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(buildDevicePayload(deviceId, json)), 60, TimeUnit.SECONDS);
            wsToDeviceId.put(wsId, deviceId);
        } catch (Exception ignored) {
            // Ignore malformed heartbeat payloads.
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String deviceId = wsToDeviceId.remove(session.getId());
        if (deviceId != null) {
            redisTemplate.delete("online_device:" + deviceId);
        }
    }

    private Map<String, Object> buildTempDevicePayload(String deviceId) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("deviceId", deviceId);
        payload.put("deviceName", "Dang ket noi...");
        payload.put("sessionId", null);
        payload.put("browser", null);
        payload.put("platform", null);
        payload.put("currentPath", null);
        payload.put("language", null);
        payload.put("temporary", true);
        payload.put("status", "CONNECTING");
        payload.put("lastSeenAt", Instant.now().toString());
        return payload;
    }

    private Map<String, Object> buildDevicePayload(String deviceId, JsonNode json) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("deviceId", deviceId);
        payload.put("deviceName", readText(json, "deviceName", deviceId));
        payload.put("sessionId", readNullableText(json, "sessionId"));
        payload.put("browser", readNullableText(json, "browser"));
        payload.put("platform", readNullableText(json, "platform"));
        payload.put("currentPath", readNullableText(json, "currentPath"));
        payload.put("language", readNullableText(json, "language"));
        payload.put("temporary", false);
        payload.put("status", "ONLINE");
        payload.put("lastSeenAt", Instant.now().toString());
        return payload;
    }

    private String readText(JsonNode json, String field, String fallback) {
        String value = readNullableText(json, field);
        return value == null || value.isBlank() ? fallback : value;
    }

    private String readNullableText(JsonNode json, String field) {
        if (!json.has(field) || json.get(field).isNull()) {
            return null;
        }
        String value = json.get(field).asText();
        return value == null || value.isBlank() || "null".equalsIgnoreCase(value) ? null : value;
    }
}

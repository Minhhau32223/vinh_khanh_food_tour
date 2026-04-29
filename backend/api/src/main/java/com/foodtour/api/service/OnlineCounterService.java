package com.foodtour.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodtour.api.websocket.AdminWebSocketHandler;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@EnableScheduling
public class OnlineCounterService implements MessageListener {

    private static final String ONLINE_COUNT_TOPIC = "online_count_topic";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private RedisMessageListenerContainer redisMessageListenerContainer;

    @Autowired
    private AdminWebSocketHandler adminWebSocketHandler;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        redisMessageListenerContainer.addMessageListener(this, new ChannelTopic(ONLINE_COUNT_TOPIC));
    }

    @Scheduled(fixedRate = 5000)
    public void countAndPublish() {
        try {
            List<Map<String, Object>> devices = readOnlineDevices();
            String payload = objectMapper.writeValueAsString(Map.of(
                    "count", devices.size(),
                    "devices", devices
            ));
            redisTemplate.convertAndSend(ONLINE_COUNT_TOPIC, payload);
        } catch (Exception ignored) {
            // Ignore transient redis or serialization errors.
        }
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message.getBody(), new TypeReference<>() {});
            int count = ((Number) payload.getOrDefault("count", 0)).intValue();
            Object devicesObject = payload.get("devices");
            List<Map<String, Object>> devices = devicesObject instanceof List<?>
                    ? objectMapper.convertValue(devicesObject, new TypeReference<>() {})
                    : List.of();
            adminWebSocketHandler.broadcastOnlineDevices(count, devices);
        } catch (Exception ignored) {
            // Ignore malformed pub/sub payloads.
        }
    }

    public List<Map<String, Object>> readOnlineDevices() {
        List<Map<String, Object>> devices = new ArrayList<>();
        Set<String> keys = redisTemplate.keys("online_device:*");
        if (keys == null || keys.isEmpty()) {
            return devices;
        }

        for (String key : keys) {
            Object rawValue = redisTemplate.opsForValue().get(key);
            String deviceId = key.substring("online_device:".length());
            devices.add(parseDevicePayload(deviceId, rawValue));
        }

        devices.sort(Comparator
                .comparing((Map<String, Object> item) -> Boolean.TRUE.equals(item.get("temporary")))
                .thenComparing(item -> String.valueOf(item.getOrDefault("deviceName", item.getOrDefault("deviceId", ""))), String.CASE_INSENSITIVE_ORDER));
        return devices;
    }

    private Map<String, Object> parseDevicePayload(String deviceId, Object rawValue) {
        if (rawValue instanceof String value) {
            try {
                Map<String, Object> parsed = objectMapper.readValue(value, new TypeReference<>() {});
                parsed.putIfAbsent("deviceId", deviceId);
                parsed.putIfAbsent("deviceName", deviceId);
                parsed.putIfAbsent("temporary", deviceId.startsWith("ws_"));
                parsed.putIfAbsent("status", deviceId.startsWith("ws_") ? "CONNECTING" : "ONLINE");
                return parsed;
            } catch (Exception ignored) {
                // Fall through to legacy mapping.
            }
        }

        return Map.of(
                "deviceId", deviceId,
                "deviceName", deviceId,
                "temporary", deviceId.startsWith("ws_"),
                "status", deviceId.startsWith("ws_") ? "CONNECTING" : "ONLINE"
        );
    }
}

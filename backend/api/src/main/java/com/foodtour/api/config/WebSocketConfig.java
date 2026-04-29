package com.foodtour.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.foodtour.api.websocket.GuestWebSocketHandler;
import com.foodtour.api.websocket.AdminWebSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private GuestWebSocketHandler guestWebSocketHandler;

    @Autowired
    private AdminWebSocketHandler adminWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(guestWebSocketHandler, "/ws/guest").setAllowedOrigins("*");
        registry.addHandler(adminWebSocketHandler, "/ws/admin").setAllowedOrigins("*");
    }
}

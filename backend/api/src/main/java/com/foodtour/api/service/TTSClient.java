package com.foodtour.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class TTSClient {

    @Value("${TTS_SERVICE_URL:http://tts-service:8000/generate}")
    private String ttsUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public byte[] generateAudio(String text, String lang) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(
                Map.of(
                        "text", text == null ? "" : text,
                        "lang", lang == null || lang.isBlank() ? "vi" : lang
                ),
                headers
        );

        ResponseEntity<byte[]> response = restTemplate.exchange(
                ttsUrl,
                HttpMethod.POST,
                request,
                byte[].class
        );

        return response.getBody();
    }
}

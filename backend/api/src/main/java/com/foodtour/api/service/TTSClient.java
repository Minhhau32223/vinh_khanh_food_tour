package com.foodtour.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TTSClient {

    @Value("${TTS_SERVICE_URL:http://tts-service:5001/tts}")
    private String ttsUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public byte[] generateAudio(String text, String lang) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("{\"text\":\"%s\",\"lang\":\"%s\"}", text, lang);

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                ttsUrl,
                HttpMethod.POST,
                request,
                byte[].class
        );

        return response.getBody();
    }
}
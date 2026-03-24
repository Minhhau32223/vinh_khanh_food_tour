package com.foodtour.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TranslationService {

    @Value("${TRANSLATE_URL}")
    private String translateUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, String> translate(String text, List<String> langs) {

        Map<String, Object> request = new HashMap<>();
        request.put("text", text);
        request.put("source", "vi");
        request.put("targets", langs);

        try {
            ResponseEntity<Map> response =
                    restTemplate.postForEntity(translateUrl, request, Map.class);

            if (response.getBody() == null) {
                return new HashMap<>();
            }

            return (Map<String, String>) response.getBody();

        } catch (Exception e) {
            System.out.println("Translate error: " + e.getMessage());
            return new HashMap<>();
        }
    }
}
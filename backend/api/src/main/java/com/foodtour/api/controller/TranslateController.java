package com.foodtour.api.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/translate")
public class TranslateController {

    @PostMapping
    public Map<String, String> translate(@RequestBody Map<String, Object> body) {
        RestTemplate rest = new RestTemplate();

        String url = "http://translate-service:5000/translate";

        ResponseEntity<Map> res = rest.postForEntity(url, body, Map.class);

        return res.getBody();
    }
}
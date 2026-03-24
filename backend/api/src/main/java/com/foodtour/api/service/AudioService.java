package com.foodtour.api.service;

import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class AudioService {

    private final TTSClient ttsClient;

    public AudioService(TTSClient ttsClient) {
        this.ttsClient = ttsClient;
    }

    public String createAudioFile(String text, String lang, String poiId) throws Exception {
        byte[] audioBytes = ttsClient.generateAudio(text, lang);

        String fileName = "poi_" + poiId + "_" + lang + ".mp3";
        Path path = Paths.get("audio/" + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, audioBytes);

        return "http://localhost:8080/audio/" + fileName;
    }
}
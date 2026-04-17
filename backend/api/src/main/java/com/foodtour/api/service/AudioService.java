package com.foodtour.api.service;
import org.springframework.stereotype.Service;


@Service
public class AudioService {
    private final TTSClient ttsClient;
    private final CloudinaryService cloudinaryService;

    public AudioService(TTSClient ttsClient, CloudinaryService cloudinaryService) {
        this.ttsClient = ttsClient;
        this.cloudinaryService=cloudinaryService;
    }

    public String createAudioFile(String text, String lang, String poiId) throws Exception {
        byte[] audioBytes = ttsClient.generateAudio(text, lang);

        String publicId = "foodtour/audio/poi_" + poiId + "_" + lang;

        return cloudinaryService.uploadAudio(audioBytes, publicId);
    }

}
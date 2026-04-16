package com.foodtour.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Service
public class AudioService {

    private final TTSClient ttsClient;
    private final Cloudinary cloudinary;

    public AudioService(TTSClient ttsClient, Cloudinary cloudinary) {
        this.ttsClient = ttsClient;
        this.cloudinary = cloudinary;
    }
    public String createAudioFile(String text, String lang, String poiId) throws Exception {
        byte[] audioBytes = ttsClient.generateAudio(text, lang);

        String publicId = "foodtour/audio/poi_" + poiId + "_" + lang;

        Map uploadResult = cloudinary.uploader().upload(
                audioBytes,
                ObjectUtils.asMap(
                        "resource_type", "video",
                        "public_id", publicId,
                        "overwrite", true
                )
        );

        return uploadResult.get("secure_url").toString();
    }

//    public String createAudioFile(String text, String lang, String poiId) throws Exception {
//        byte[] audioBytes = ttsClient.generateAudio(text, lang);
//
//        String fileName = "poi_" + poiId + "_" + lang + ".mp3";
//        Path path = Paths.get("audio/" + fileName);
//        Files.createDirectories(path.getParent());
//        Files.write(path, audioBytes);
//
//        return "http://localhost:8080/audio/" + fileName;
//    }
}
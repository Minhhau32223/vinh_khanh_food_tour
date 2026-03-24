package com.foodtour.api.service.impl;

import com.foodtour.api.dto.PoiContentsRequest;
import com.foodtour.api.dto.PoiContentsResponse;
import com.foodtour.api.entity.Poi;
import com.foodtour.api.entity.PoiContents;
import com.foodtour.api.repository.PoiContentRepository;
import com.foodtour.api.repository.PoiRepository;
import com.foodtour.api.service.AudioService;
import com.foodtour.api.service.PoiContentsService;
import com.foodtour.api.service.TranslationService;
import com.google.api.client.util.Value;
import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PoiContentsServiceImpl implements PoiContentsService {
    private final PoiContentRepository poiContentRepository;
    private final TranslationService translationService;
    private final PoiRepository poiRepository;
    private final AudioService audioService;
    // Danh sách ngôn ngữ: vi + 15 ngôn ngữ khác
    private final List<String> langs = List.of(
            "en","fr","de","ja","ko","zh-CN","es","ru","it","pt","th","ar","tr","id"
    );

    @Override
    public List<PoiContentsResponse> createPoiContents(Long poiId, PoiContentsRequest request) throws Exception {

        Poi poi = poiRepository.findById(poiId)
                .orElseThrow(() -> new RuntimeException("POI not found"));

        List<PoiContents> results = new ArrayList<>();

        String separator = "###SPLIT###";

        // ===== 1. LƯU TIẾNG VIỆT =====
        if (poiContentRepository.findByPoiIdAndLanguageCode(poiId, "vi").isEmpty()) {

            String viTitle = request.getTitle();
            String viDescription = request.getDescription();
            String viScript = request.getTtsScript();

            String viAudio = audioService.createAudioFile(
                    viScript,
                    "vi",
                    poiId.toString()
            );

            PoiContents viContent = PoiContents.builder()
                    .poi(poi)
                    .languageCode("vi")
                    .title(viTitle)
                    .description(viDescription)
                    .ttsScript(viScript)
                    .imageUrls(request.getImageUrls())
                    .audioFileUrl(viAudio)
                    .build();

            results.add(viContent);
        }

        // ===== 2. CHUẨN BỊ DỊCH =====
        String combined = request.getTitle() + separator
                + request.getDescription() + separator
                + request.getTtsScript();

        List<String> targetLangs = langs.stream()
                .filter(lang -> !"vi".equals(lang))
                .toList();

        Map<String, String> translations =
                translationService.translate(combined, targetLangs);
        System.out.println(translations);

        // ===== 3. TẠO CÁC NGÔN NGỮ KHÁC =====
        List<PoiContents> existingList = poiContentRepository.findByPoiId(poiId);
        Set<String> existingLangs = existingList.stream()
                .map(PoiContents::getLanguageCode)
                .collect(Collectors.toSet());
        for (String lang : targetLangs) {

            // bỏ qua nếu đã có
//            if (poiContentRepository.findByPoiIdAndLanguageCode(poiId, lang).isPresent()) {
//                continue;
//            }
            if (existingLangs.contains(lang)) {
                continue;
            }

            if (translations == null || !translations.containsKey(lang)) {
                continue;
            }

            String translated = translations.get(lang);

            if (translated == null || !translated.contains(separator)) {
                //continue;
                translated = combined;
            }

            String[] parts = translated.split(separator);

            if (parts.length < 3) {
                continue;
            }

            String title = parts[0];
            String description = parts[1];
            String script = parts[2];

            String audioUrl = audioService.createAudioFile(
                    script,
                    lang,
                    poiId.toString()
            );

            PoiContents content = PoiContents.builder()
                    .poi(poi)
                    .languageCode(lang)
                    .title(title)
                    .description(description)
                    .ttsScript(script)
                    .imageUrls(request.getImageUrls())
                    .audioFileUrl(audioUrl)
                    .build();

            results.add(content);
        }

        return contentsResponse(poiContentRepository.saveAll(results));
    }



    @Override
    public PoiContentsResponse getPoiContentsByIdLanguage(Long id, String language) {

        return poiContentRepository.findByPoiIdAndLanguageCode(id,language)
                .map( poiContents -> contentsResponse(poiContents))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nội dung POI với id: " + id + " và ngôn ngữ: " + language));
    }

    private List<PoiContentsResponse> contentsResponse(List<PoiContents> contentsList){
        return contentsList.stream().map(this::contentsResponse).toList();
    }

    private PoiContentsResponse contentsResponse(PoiContents poiContents) {
        return PoiContentsResponse.builder()
                .id(poiContents.getId())
                .poiId(poiContents.getPoi().getId())
                .title(poiContents.getTitle())
                .description(poiContents.getDescription())
                .audioFileUrl(poiContents.getAudioFileUrl())
                .languageCode(poiContents.getLanguageCode())
                .imageUrls(poiContents.getImageUrls())
                .ttsScript(poiContents.getTtsScript())
                .createdAt(poiContents.getCreatedAt())
                .updatedAt(poiContents.getUpdatedAt())
                .build();
    };
}

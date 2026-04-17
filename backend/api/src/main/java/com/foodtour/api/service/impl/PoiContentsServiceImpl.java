package com.foodtour.api.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodtour.api.dto.PoiContentsRequest;
import com.foodtour.api.dto.PoiContentsResponse;
import com.foodtour.api.dto.PoiResponse;
import com.foodtour.api.dto.offline.OfflinePackageResponse;
import com.foodtour.api.dto.offline.OfflinePoiPackageItemResponse;
import com.foodtour.api.entity.Poi;
import com.foodtour.api.entity.PoiContents;
import com.foodtour.api.repository.PoiContentRepository;
import com.foodtour.api.repository.PoiRepository;
import com.foodtour.api.security.CustomUserDetails;
import com.foodtour.api.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PoiContentsServiceImpl implements PoiContentsService {
    private static final List<String> SUPPORTED_LANGUAGES = List.of(
            "vi", "en", "fr", "de", "ja", "ko", "zh-CN", "es", "ru", "it", "pt", "th", "ar", "tr", "id"
    );

    private final PoiContentRepository poiContentRepository;
    private final TranslationService translationService;
    private final PoiRepository poiRepository;
    private final AudioService audioService;
  //  private final ImageService imageService;
    private final CloudinaryService cloudinaryService;
    // Danh sách ngôn ngữ: vi + 15 ngôn ngữ khác
    private final List<String> langs = List.of(
            "en","fr","de","ja","ko","zh-CN","es","ru","it","pt","th","ar","tr","id"
    );

    @Override
    public List<PoiContentsResponse> createPoiContents(Long poiId, PoiContentsRequest request,
                                                       List<MultipartFile> images) throws Exception {

        Poi poi = poiRepository.findById(poiId)
                .orElseThrow(() -> new RuntimeException("POI not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            String role = userDetails.getUser().getRole();
            if ("OWNER".equals(role) && !userDetails.getUser().getId().equals(poi.getOwnerId())) {
                throw new AccessDeniedException("Owner can only update content of own POI");
            }
        }

        List<PoiContents> results = new ArrayList<>();
        String separator = "###SPLIT###";


        // ===== 1. LƯU TIẾNG VIỆT =====
        PoiContents viContent = poiContentRepository.findByPoiIdAndLanguageCode(poiId, "vi")
                .orElseGet(() -> PoiContents.builder()
                        .poi(poi)
                        .languageCode("vi")
                        .build());

        viContent.setPoi(poi);
        viContent.setLanguageCode("vi");
        String title = safeText(request.getTitle());
        String description = safeText(request.getDescription());
        String ttsScript = safeText(request.getTtsScript());
        String imageUrls = writeImageUrls(mergeImageUrls(
                request.getImageUrls(),
                viContent.getImageUrls(),
                uploadImages(poiId, images)
        ));
        viContent.setTitle(title);
        viContent.setDescription(description);
        viContent.setTtsScript(ttsScript);
        viContent.setImageUrls(imageUrls);
        viContent.setAudioFileUrl(
                audioService.createAudioFile(ttsScript, "vi", poiId.toString())
        );

        results.add(viContent);

        // POI chờ duyệt: chỉ lưu tiếng Việt, chưa dịch và chưa tạo đa ngôn ngữ.
        if (!"APPROVED".equals(poi.getStatus())) {
            return contentsResponse(poiContentRepository.saveAll(results));
        }

        // ===== 2. CHUẨN BỊ DỊCH =====
        String combined = title + separator
                + description + separator
                + ttsScript;


        List<String> targetLangs = SUPPORTED_LANGUAGES.stream()
                .filter(lang -> !"vi".equals(lang))
                .toList();

        Map<String, String> translations =
                translationService.translate(combined, targetLangs);

        // ===== 3. TẠO CÁC NGÔN NGỮ KHÁC =====
        Map<String, PoiContents> existingByLang = poiContentRepository.findByPoiId(poiId).stream()
                .collect(Collectors.toMap(PoiContents::getLanguageCode, content -> content, (left, right) -> left));
        for (String lang : targetLangs) {

            // bỏ qua nếu đã có
//            if (poiContentRepository.findByPoiIdAndLanguageCode(poiId, lang).isPresent()) {
//                continue;
//            }
            String translated = translations != null ? translations.get(lang) : null;

            if (translated == null || !translated.contains(separator)) {
                translated = combined;
            }

            String[] parts = translated.split(separator);

            if (parts.length < 3) {
                continue;
            }

            String title1 = parts[0];
            String description1 = parts[1];
            String script = parts[2];

            String audioUrl = audioService.createAudioFile(
                    script,
                    lang,
                    poiId.toString()
            );

            PoiContents content = existingByLang.getOrDefault(lang, PoiContents.builder()
                    .poi(poi)
                    .languageCode(lang)
                    .build());
            content.setPoi(poi);
            content.setLanguageCode(lang);
            content.setTitle(title1);
            content.setDescription(description1);
            content.setTtsScript(script);
            content.setImageUrls(imageUrls);
            content.setAudioFileUrl(audioUrl);

            results.add(content);
        }

        return contentsResponse(poiContentRepository.saveAll(results));
    }

    @Override
    public List<PoiContentsResponse> updatePoiContents(Long poiId, List<MultipartFile> images) throws Exception {
        List<PoiContents> contents = poiContentRepository.findByPoiId(poiId);
        List<String> uploadedUrls = uploadImages(poiId, images);
        for (PoiContents content : contents) {
            content.setImageUrls(writeImageUrls(mergeImageUrls(null, content.getImageUrls(), uploadedUrls)));
        }

        return contentsResponse(poiContentRepository.saveAll(contents));
    }

    @Override
    public void translateAndGenerateForPoi(Long poiId) throws Exception {
        Poi poi = poiRepository.findById(poiId)
                .orElseThrow(() -> new RuntimeException("POI not found"));
        PoiContents viContent = poiContentRepository.findByPoiIdAndLanguageCode(poiId, "vi")
                .orElseThrow(() -> new RuntimeException("Vietnamese content is required before approval"));

        String separator = "###SPLIT###";
        String combined = viContent.getTitle() + separator + viContent.getDescription() + separator + viContent.getTtsScript();
        List<String> targetLangs = SUPPORTED_LANGUAGES.stream().filter(lang -> !"vi".equals(lang)).toList();
        Map<String, String> translations = translationService.translate(combined, targetLangs);

        Map<String, PoiContents> existingByLang = poiContentRepository.findByPoiId(poiId).stream()
                .collect(Collectors.toMap(PoiContents::getLanguageCode, content -> content, (left, right) -> left));
        List<PoiContents> created = new ArrayList<>();

        for (String lang : targetLangs) {
            String translated = translations != null ? translations.get(lang) : null;
            if (translated == null || !translated.contains(separator)) translated = combined;
            String[] parts = translated.split(separator);
            if (parts.length < 3) continue;

            String audioUrl = audioService.createAudioFile(parts[2], lang, poiId.toString());
            PoiContents content = existingByLang.getOrDefault(lang, PoiContents.builder()
                    .poi(poi)
                    .languageCode(lang)
                    .build());
            content.setPoi(poi);
            content.setLanguageCode(lang);
            content.setTitle(parts[0]);
            content.setDescription(parts[1]);
            content.setTtsScript(parts[2]);
            content.setImageUrls(viContent.getImageUrls());
            content.setAudioFileUrl(audioUrl);
            created.add(content);
        }

        if (!created.isEmpty()) {
            poiContentRepository.saveAll(created);
        }
    }



    @Override
    public PoiContentsResponse getPoiContentsByIdLanguage(Long id, String language) {

        return poiContentRepository.findByPoiIdAndLanguageCode(id,language)
                .map( poiContents -> contentsResponse(poiContents))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nội dung POI với id: " + id + " và ngôn ngữ: " + language));
    }

    @Override
    public List<PoiContentsResponse> getPoiContents(Long poiId) {
        return poiContentRepository.findByPoiId(poiId).stream()
                .sorted(Comparator.comparingInt(content -> {
                    int idx = SUPPORTED_LANGUAGES.indexOf(content.getLanguageCode());
                    return idx >= 0 ? idx : Integer.MAX_VALUE;
                }))
                .map(this::contentsResponse)
                .toList();
    }

    @Override
    public List<String> getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }

    @Override
    public OfflinePackageResponse buildOfflinePackage(String language) {
        String requestedLanguage = hasText(language) ? language.trim() : "vi";

        List<OfflinePoiPackageItemResponse> items = poiRepository.findByIsActiveTrueAndStatus("APPROVED").stream()
                .map(poi -> mapOfflineItem(poi, requestedLanguage))
                .filter(item -> item.getContent() != null)
                .toList();

        return OfflinePackageResponse.builder()
                .language(requestedLanguage)
                .generatedAt(LocalDateTime.now())
                .totalPois(items.size())
                .supportedLanguages(SUPPORTED_LANGUAGES)
                .items(items)
                .build();
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
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private OfflinePoiPackageItemResponse mapOfflineItem(Poi poi, String requestedLanguage) {
        PoiContents content = poiContentRepository.findByPoiIdAndLanguageCode(poi.getId(), requestedLanguage)
                .orElseGet(() -> {
                    if ("vi".equals(requestedLanguage)) {
                        return null;
                    }
                    return poiContentRepository.findByPoiIdAndLanguageCode(poi.getId(), "vi").orElse(null);
                });

        boolean fallbackToVietnamese = content != null && !"vi".equals(requestedLanguage)
                && "vi".equals(content.getLanguageCode());

        return OfflinePoiPackageItemResponse.builder()
                .poi(mapPoiResponse(poi))
                .content(content != null ? contentsResponse(content) : null)
                .usedFallbackToVietnamese(fallbackToVietnamese)
                .build();
    }

    private PoiResponse mapPoiResponse(Poi poi) {
        return PoiResponse.builder()
                .id(poi.getId())
                .name(poi.getName())
                .latitude(poi.getLatitude())
                .longitude(poi.getLongitude())
                .triggerRadius(poi.getTriggerRadius())
                .priority(poi.getPriority())
                .isActive(poi.getIsActive())
                .status(poi.getStatus())
                .ownerId(poi.getOwnerId())
                .createdAt(poi.getCreatedAt())
                .updatedAt(poi.getUpdatedAt())
                .build();
    }

    private String safeText(String value) {
        return value == null ? "" : value.trim();
    }

    private List<String> uploadImages(Long poiId, List<MultipartFile> images) throws Exception {
        List<String> uploadedUrls = new ArrayList<>();
        if (images == null || images.isEmpty()) {
            return uploadedUrls;
        }

        for (MultipartFile file : images) {
            String publicId = "foodtour/image/poi_" + poiId + "_" + System.currentTimeMillis();
            uploadedUrls.add(cloudinaryService.uploadImage(file.getBytes(), publicId));
        }
        return uploadedUrls;
    }

    private List<String> mergeImageUrls(String requestImageUrls, String existingImageUrls, List<String> uploadedUrls) {
        LinkedHashSet<String> merged = new LinkedHashSet<>();
        merged.addAll(parseImageUrls(requestImageUrls));
        if (merged.isEmpty()) {
            merged.addAll(parseImageUrls(existingImageUrls));
        }
        merged.addAll(uploadedUrls);
        return new ArrayList<>(merged);
    }

    private List<String> parseImageUrls(String value) {
        if (!hasText(value)) {
            return new ArrayList<>();
        }

        try {
            return new ObjectMapper().readValue(value, new TypeReference<List<String>>() {});
        } catch (Exception ignored) {
            return List.of(value.split("\\n")).stream()
                    .map(String::trim)
                    .filter(item -> !item.isEmpty())
                    .toList();
        }
    }

    private String writeImageUrls(List<String> imageUrls) throws Exception {
        return new ObjectMapper().writeValueAsString(imageUrls);
    }
}

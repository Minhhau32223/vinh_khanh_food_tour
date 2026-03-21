package com.foodtour.api.service.impl;

import com.foodtour.api.dto.PoiContent.CreatePoiContentRequest;
import com.foodtour.api.dto.PoiContent.PoiContentResponse;
import com.foodtour.api.entity.PoiContent;
import com.foodtour.api.repository.PoiContentRepository;
import com.foodtour.api.service.PoiContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PoiContentServiceImpl implements PoiContentService {

    private final PoiContentRepository poiContentRepository;

    @Override
    public PoiContentResponse createPoiContent(CreatePoiContentRequest request) {

        PoiContent poiContent = PoiContent.builder()
                .poiId(request.getPoiId())
                .languageCode(request.getLanguageCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrls(request.getImageUrls())
                .audioFileUrl(request.getAudioFileUrl())
                .ttsScript(request.getTtsScript())
                .build();

        poiContentRepository.save(poiContent);

        return mapToResponse(poiContent);
    }

    // mapper entity -> dto
    private PoiContentResponse mapToResponse(PoiContent poiContent) {
        return PoiContentResponse.builder()
                .id(poiContent.getId())
                .poiId(poiContent.getPoiId())
                .languageCode(poiContent.getLanguageCode())
                .title(poiContent.getTitle())
                .description(poiContent.getDescription())
                .imageUrls(poiContent.getImageUrls())
                .audioFileUrl(poiContent.getAudioFileUrl())
                .ttsScript(poiContent.getTtsScript())
                .createdAt(poiContent.getCreatedAt())
                .updatedAt(poiContent.getUpdatedAt())
                .build();
    }
}
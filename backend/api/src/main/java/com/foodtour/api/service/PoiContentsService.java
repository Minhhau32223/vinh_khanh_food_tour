package com.foodtour.api.service;

import com.foodtour.api.dto.PoiContentsRequest;
import com.foodtour.api.dto.PoiContentsResponse;

import java.util.List;

public interface PoiContentsService {
    List<PoiContentsResponse> createPoiContents(Long id, PoiContentsRequest request) throws Exception;
    PoiContentsResponse getPoiContentsByIdLanguage(Long id, String language);
    List<PoiContentsResponse> getPoiContents(Long poiId);
    List<String> getSupportedLanguages();
    void translateAndGenerateForPoi(Long poiId) throws Exception;

}

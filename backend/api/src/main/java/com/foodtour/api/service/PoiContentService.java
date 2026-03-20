package com.foodtour.api.service;

import com.foodtour.api.dto.PoiContent.CreatePoiContentRequest;
import com.foodtour.api.dto.PoiContent.PoiContentResponse;

public interface PoiContentService {
    PoiContentResponse createPoiContent(CreatePoiContentRequest request);
}
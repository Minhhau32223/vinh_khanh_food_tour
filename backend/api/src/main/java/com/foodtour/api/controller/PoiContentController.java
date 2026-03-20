package com.foodtour.api.controller;

import com.foodtour.api.dto.PoiContent.CreatePoiContentRequest;
import com.foodtour.api.dto.PoiContent.PoiContentResponse;
import com.foodtour.api.service.PoiContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/poi-contents")
@RequiredArgsConstructor
public class PoiContentController {

    private final PoiContentService poiContentService;

    @PostMapping
    public ResponseEntity<PoiContentResponse> createPoiContent(
            @RequestBody CreatePoiContentRequest request
    ) {
        return new ResponseEntity<>(
                poiContentService.createPoiContent(request),
                HttpStatus.CREATED
        );
    }
}
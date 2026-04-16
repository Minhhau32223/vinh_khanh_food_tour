package com.foodtour.api.service.impl;

import com.foodtour.api.dto.Tour.*;
import com.foodtour.api.entity.Poi;
import com.foodtour.api.entity.Tour;
import com.foodtour.api.entity.Tour_Pois;
import com.foodtour.api.repository.PoiRepository;
import com.foodtour.api.repository.TourRepository;
import com.foodtour.api.repository.Tour_PoisRepository;
import com.foodtour.api.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {
    private final TourRepository tourRepository;
    private final Tour_PoisRepository tourPOIRepository;
    private final PoiRepository poiRepository;

    @Override
    public List<TourResponse> getAllTours() {
        return tourRepository.findAll()
                .stream()
                .map(this::mapToResponseWithPois)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TourResponse createTour(CreateTourRequest request) {
        Tour tour = Tour.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isSystem(request.getIsSystem() != null ? request.getIsSystem() : true)
                .createdBy(request.getCreatedBy())
                .isActive(true)
                .build();

        Tour saved = tourRepository.save(tour);
        replaceTourPois(saved.getId(), request.getPois());
        return mapToResponseWithPois(saved);
    }

    @Override
    @Transactional
    public TourResponse updateTour(Long id, UpdateTourRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        tour.setName(request.getName());
        tour.setDescription(request.getDescription());

        if (request.getIsSystem() != null) {
            tour.setIsSystem(request.getIsSystem());
        }

        if (request.getIsActive() != null) {
            tour.setIsActive(request.getIsActive());
        }

        Tour saved = tourRepository.save(tour);
        if (request.getPois() != null) {
            replaceTourPois(id, request.getPois());
        }
        return mapToResponseWithPois(saved);
    }

    @Override
    public void deleteTour(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        tour.setIsActive(false);
        tourRepository.save(tour);
    }

    private void replaceTourPois(Long tourId, List<TourPoiOrderRequest> pois) {
        if (pois == null) {
            return;
        }
        tourPOIRepository.deleteByTourId(tourId);
        int idx = 0;
        List<Tour_Pois> rows = new ArrayList<>();
        for (TourPoiOrderRequest item : pois) {
            idx++;
            int order = item.getOrderIndex() != null ? item.getOrderIndex() : idx;
            rows.add(Tour_Pois.builder()
                    .tourId(tourId)
                    .poiId(item.getPoiId())
                    .orderIndex(order)
                    .build());
        }
        tourPOIRepository.saveAll(rows);
    }

    private TourResponse mapToResponseWithPois(Tour tour) {
        List<Tour_PoisResponse> pois = tourPOIRepository.findByTourIdOrderByOrderIndexAsc(tour.getId())
                .stream()
                .map(tp -> {
                    String name = poiRepository.findById(tp.getPoiId())
                            .map(Poi::getName)
                            .orElse("POI #" + tp.getPoiId());
                    return Tour_PoisResponse.builder()
                            .poiId(tp.getPoiId())
                            .orderIndex(tp.getOrderIndex())
                            .poiName(name)
                            .build();
                })
                .toList();

        return TourResponse.builder()
                .id(tour.getId())
                .name(tour.getName())
                .description(tour.getDescription())
                .isSystem(tour.getIsSystem())
                .createdBy(tour.getCreatedBy())
                .isActive(tour.getIsActive())
                .createdAt(tour.getCreatedAt())
                .updatedAt(tour.getUpdatedAt())
                .pois(pois)
                .build();
    }

    @Override
    public TourDetailResponse getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        List<Tour_PoisResponse> pois = tourPOIRepository
                .findByTourIdOrderByOrderIndexAsc(id)
                .stream()
                .map(tp -> {
                    String name = poiRepository.findById(tp.getPoiId())
                            .map(Poi::getName)
                            .orElse("POI #" + tp.getPoiId());
                    return Tour_PoisResponse.builder()
                            .poiId(tp.getPoiId())
                            .orderIndex(tp.getOrderIndex())
                            .poiName(name)
                            .build();
                })
                .toList();

        return TourDetailResponse.builder()
                .id(tour.getId())
                .name(tour.getName())
                .description(tour.getDescription())
                .isSystem(tour.getIsSystem())
                .createdBy(tour.getCreatedBy())
                .isActive(tour.getIsActive())
                .createdAt(tour.getCreatedAt())
                .updatedAt(tour.getUpdatedAt())
                .pois(pois)
                .build();
    }
}

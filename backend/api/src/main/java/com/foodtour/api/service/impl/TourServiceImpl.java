package com.foodtour.api.service.impl;

import com.foodtour.api.dto.Tour.*;
import com.foodtour.api.entity.Tour;
import com.foodtour.api.repository.TourRepository;
import com.foodtour.api.repository.Tour_PoisRepository;
import com.foodtour.api.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {
    private final TourRepository tourRepository;
    private final Tour_PoisRepository tourPOIRepository;

    @Override
    public List<TourResponse> getAllTours() {
        return tourRepository.findByIsActiveTrue()
                .stream()
                .map(tour -> mapToResponse(tour))
                .collect(Collectors.toList());

    }

    @Override
    public TourResponse createTour(CreateTourRequest request) {
        Tour tour = Tour.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isSystem(request.getIsSystem())
                .createdBy(request.getCreatedBy())
                .build();

        tourRepository.save(tour);
        return mapToResponse(tour);
    }

    @Override
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

        return mapToResponse(tourRepository.save(tour));
    }

    @Override
    public void deleteTour(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        tourRepository.delete(tour);
    }

    private TourResponse mapToResponse(Tour tour) {
        if (tour == null) {
            return null;
        }

        return TourResponse.builder()
                .id(tour.getId())
                .name(tour.getName())
                .description(tour.getDescription())
                .isSystem(tour.getIsSystem())
                .createdBy(tour.getCreatedBy())
                .isActive(tour.getIsActive())
                .createdAt(tour.getCreatedAt())
                .updatedAt(tour.getUpdatedAt())
                .build();
    }

    @Override
    public TourDetailResponse getTourById(Long id) {

        // 1. Lấy tour
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        // 2. Lấy danh sách POI theo order
        List<Tour_PoisResponse> pois = tourPOIRepository
                .findByTourIdOrderByOrderIndexAsc(id)
                .stream()
                .map(tp -> Tour_PoisResponse.builder()
                        .poiId(tp.getPoiId())
                        .orderIndex(tp.getOrderIndex())
                        .build())
                .toList();

        // 3. Trả response
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

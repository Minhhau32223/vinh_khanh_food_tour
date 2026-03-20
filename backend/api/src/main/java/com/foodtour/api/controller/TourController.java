package com.foodtour.api.controller;


import com.foodtour.api.dto.Tour.CreateTourRequest;
import com.foodtour.api.dto.Tour.TourDetailResponse;
import com.foodtour.api.dto.Tour.TourResponse;
import com.foodtour.api.dto.Tour.UpdateTourRequest;
import com.foodtour.api.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {
    private final TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourResponse>> getAllTours() { return ResponseEntity.ok(tourService.getAllTours());}

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourResponse> createTour(@Valid @RequestBody CreateTourRequest request) {
        return new ResponseEntity<>(tourService.createTour(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TourResponse updateTour(
            @PathVariable Long id,
            @RequestBody UpdateTourRequest request
    ) {
        return tourService.updateTour(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDetailResponse> getTourById(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getTourById(id));
    }
}

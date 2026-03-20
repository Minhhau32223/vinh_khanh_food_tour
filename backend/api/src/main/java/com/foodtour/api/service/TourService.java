package com.foodtour.api.service;

import com.foodtour.api.dto.Tour.CreateTourRequest;
import com.foodtour.api.dto.Tour.TourDetailResponse;
import com.foodtour.api.dto.Tour.TourResponse;
import com.foodtour.api.dto.Tour.UpdateTourRequest;

import java.util.List;

public interface TourService {
    //all system
    List<TourResponse> getAllTours();
    //get 1 tour
//    TourResponse getTourById(Long id);
    //tạo tour
    TourResponse createTour (CreateTourRequest request);

    TourResponse updateTour(Long id, UpdateTourRequest request);

    void deleteTour(Long id);

    TourDetailResponse getTourById(Long id);
}

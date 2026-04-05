package com.foodtour.api.repository;

import com.foodtour.api.entity.Tour_Pois;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Tour_PoisRepository extends JpaRepository<Tour_Pois, Long> {

    List<Tour_Pois> findByTourIdOrderByOrderIndexAsc(Long tourId);

    void deleteByTourId(Long tourId);
}

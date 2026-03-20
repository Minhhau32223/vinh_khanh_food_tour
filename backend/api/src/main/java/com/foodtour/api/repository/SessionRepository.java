package com.foodtour.api.repository;

import com.foodtour.api.entity.Poi;
import com.foodtour.api.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRepository extends JpaRepository<Session, String> {
    
}
package com.foodtour.api.repository;

import com.foodtour.api.entity.QRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QRCodeRepository  extends JpaRepository<QRCode, Long>{
}

package com.foodtour.api.repository;

import com.foodtour.api.entity.QRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, Long> {

    Optional<QRCode> findFirstByQrValueAndIsActiveTrue(String qrValue);

    List<QRCode> findByPoiId(Long poiId);
}

package com.foodtour.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class ImageService {
    private final Cloudinary cloudinary;
    public ImageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
        log.info("ImageService initialized with Cloudinary: {}", cloudinary);
    }
    public String uploadImage(byte[] fileBytes, String poiId) throws Exception {
        Map uploadResult = cloudinary.uploader().upload(
                fileBytes,
                ObjectUtils.asMap("public_id", "foodtour/image/poi_" + poiId + "_" + System.currentTimeMillis())
        );
        return uploadResult.get("secure_url").toString();
    }


}
//    public String uploadImage(String data, String poiId) throws Exception {
//
//        // Nếu đã là URL (Cloudinary) thì giữ nguyên
//        if (data.startsWith("http")) {
//            return data;
//        }
//
//        String publicId = "foodtour/image/poi_" + poiId + "_" + System.currentTimeMillis();
//
//        Map uploadResult = cloudinary.uploader().upload(
//                data,
//                ObjectUtils.asMap(
//                        "public_id", publicId,
//                        "overwrite", true
//                )
//        );
//
//        return uploadResult.get("secure_url").toString();
//    }

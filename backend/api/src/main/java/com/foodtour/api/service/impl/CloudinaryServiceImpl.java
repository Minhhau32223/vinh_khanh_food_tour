package com.foodtour.api.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.foodtour.api.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(byte[] fileBytes, String publicId) throws Exception {

    Map uploadResult = cloudinary.uploader().upload(
            fileBytes,
            ObjectUtils.asMap(
                    "public_id", publicId
            )
    );
    return uploadResult.get("secure_url").toString();
}


    @Override
    public String uploadAudio(byte[] fileBytes, String publicId) throws Exception {
        Map uploadResult = cloudinary.uploader().upload(
                fileBytes,
                ObjectUtils.asMap(
                        "resource_type", "video",
                        "public_id", publicId,
                        "overwrite", true
                )
        );
        return uploadResult.get("secure_url").toString();

    }
}


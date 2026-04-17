package com.foodtour.api.service;

import com.cloudinary.Cloudinary;

public interface CloudinaryService {
    String uploadImage(byte[] fileBytes, String publicId) throws Exception;
    String uploadAudio(byte[] fileBytes, String publicId) throws Exception;
}

package com.foodtour.api.controller;

import com.foodtour.api.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File ảnh đang rỗng");
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new RuntimeException("Chỉ hỗ trợ upload file ảnh");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new RuntimeException("Định dạng ảnh không được hỗ trợ");
        }

        String publicId = "foodtour/image/upload_" + UUID.randomUUID();
        try {
            String secureUrl = cloudinaryService.uploadImage(file.getBytes(), publicId);
            return ResponseEntity.ok(Map.of(
                    "filename", originalFilename,
                    "url", secureUrl
            ));
        } catch (Exception ex) {
            throw new RuntimeException("Khong the upload anh len Cloudinary", ex);
        }
    }

    private String extractExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        if (index < 0) {
            return "";
        }
        return fileName.substring(index);
    }
}

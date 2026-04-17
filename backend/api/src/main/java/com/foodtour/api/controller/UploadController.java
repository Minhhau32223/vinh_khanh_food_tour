package com.foodtour.api.controller;

import com.foodtour.api.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".tif"
    );

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File ảnh đang rỗng"));
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "image.jpg" : file.getOriginalFilename()
        );
        String extension = extractExtension(originalFilename);

        // Check extension — more reliable than Content-Type which can be null or MIME-incorrect
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Định dạng ảnh không được hỗ trợ. Chỉ hỗ trợ: jpg, jpeg, png, gif, webp"
                ));
            }
            extension = contentTypeToExtension(contentType);
        }

        String publicId = "foodtour/image/upload_" + UUID.randomUUID();
        try {
            String secureUrl = cloudinaryService.uploadImage(file.getBytes(), publicId);
            return ResponseEntity.ok(Map.of(
                    "filename", (Object) originalFilename,
                    "url", (Object) secureUrl
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", (Object) ("Không thể upload ảnh lên Cloudinary: " + ex.getMessage())
            ));
        }
    }

    private String extractExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        if (index < 0 || index == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(index);
    }

    private String contentTypeToExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "image/bmp" -> ".bmp";
            default -> ".jpg";
        };
    }
}

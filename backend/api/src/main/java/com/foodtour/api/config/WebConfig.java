package com.foodtour.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.storage.image-dir:../img}")
    private String imageDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Cấu hình để phục vụ file tĩnh trong thư mục audio/
        // URL path: /audio/** -> Filesystem path: audio/
        Path audioPath = Paths.get("audio");
        String absolutePath = audioPath.toFile().getAbsolutePath();

        registry.addResourceHandler("/audio/**")
                .addResourceLocations("file:" + absolutePath + "/");

        Path imagePath = Paths.get(imageDir);
        String absoluteImagePath = imagePath.toFile().getAbsolutePath();

        registry.addResourceHandler("/img/**")
                .addResourceLocations("file:" + absoluteImagePath + "/");
    }
}

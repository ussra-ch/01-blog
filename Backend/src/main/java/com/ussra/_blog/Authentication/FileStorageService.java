package com.ussra._blog.Authentication;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.awt.*;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private void resizeAndSave(Path targetPath, int maxWidth) throws IOException {
        BufferedImage original = ImageIO.read(targetPath.toFile());
        if (original == null || original.getWidth() <= maxWidth) return; // already small enough

        int newHeight = (int) ((double) original.getHeight() / original.getWidth() * maxWidth);
        BufferedImage resized = new BufferedImage(maxWidth, newHeight, BufferedImage.TYPE_INT_RGB);

        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(original, 0, 0, maxWidth, newHeight, null);
        g.dispose();

        String filename = targetPath.getFileName().toString();
        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        String format = ext.equals("jpg") ? "jpeg" : ext;

        ImageIO.write(resized, format, targetPath.toFile());
    }


    public String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate a unique filename to avoid conflicts
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        resizeAndSave(filePath, 1200);

        return filePath.toString();
    }

    public void deleteFile(String storedPath) throws IOException {
        if (storedPath == null || storedPath.isBlank()) {
            return;
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path filePath = Paths.get(storedPath).toAbsolutePath().normalize();
        if (!filePath.startsWith(uploadPath)) {
            throw new IOException("Refusing to delete a file outside the upload directory");
        }

        Files.deleteIfExists(filePath);
    }
}

package com.playvee.backend.park.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import com.playvee.backend.park.dto.ParkPhotoResponse;
import com.playvee.backend.park.model.ParkPhoto;
import com.playvee.backend.park.repository.*;

@Service
public class ParkPhotoService {
    private static final Logger log = LoggerFactory.getLogger(ParkPhotoService.class);
    private final ParkRepository parks;
    private final ParkPhotoRepository photos;
    private final Path directory;
    private final TransactionTemplate transaction;

    public ParkPhotoService(ParkRepository parks, ParkPhotoRepository photos,
            PlatformTransactionManager manager, @Value("${playvee.upload-dir}") String directory) {
        this.parks = parks;
        this.photos = photos;
        this.directory = Path.of(directory).toAbsolutePath().normalize();
        this.transaction = new TransactionTemplate(manager);
    }

    public ParkPhotoResponse upload(Long parkId, MultipartFile file) {
        if (parks.findByIdAndDeletedAtIsNull(parkId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        if (file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty image");
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE);
        }
        String format;
        try (var input = new MemoryCacheImageInputStream(file.getInputStream())) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image");
            var reader = readers.next();
            try {
                format = reader.getFormatName().toLowerCase(java.util.Locale.ROOT);
                if (!format.equals("jpeg") && !format.equals("png")) {
                    throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
                }
                reader.setInput(input, true, true);
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (pixels <= 0 || pixels > 25_000_000) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image exceeds 25 megapixels");
                }
                if (reader.read(0) == null) throw new IOException("Invalid image");
            } finally {
                reader.dispose();
            }
        } catch (IOException | IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image", ex);
        }
        String key = UUID.randomUUID() + (format.equals("jpeg") ? ".jpg" : ".png");
        Path target = directory.resolve(key);
        boolean created = false;
        try {
            Files.createDirectories(directory);
            Files.createFile(target);
            created = true;
            try (var input = file.getInputStream(); var output = Files.newOutputStream(target)) {
                input.transferTo(output);
            }
            // Catch failures from the database commit as well as from the insert.
            return transaction.execute(status -> {
                var park = parks.findByIdAndDeletedAtIsNull(parkId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
                var photo = photos.save(new ParkPhoto(park, key, "image/" + format, file.getSize()));
                return ParkPhotoResponse.of(parkId, photo.getId());
            });
        } catch (IOException | RuntimeException ex) {
            try { if (created) Files.deleteIfExists(target); }
            catch (IOException cleanup) { log.warn("Could not remove failed upload {}", key, cleanup); }
            if (ex instanceof RuntimeException runtime) throw runtime;
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Image storage failed", ex);
        }
    }

    public ResponseEntity<FileSystemResource> image(Long parkId, Long photoId) {
        var photo = photos.findByIdAndPark_IdAndDeletedAtIsNullAndPark_DeletedAtIsNull(photoId, parkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var path = directory.resolve(photo.getStorageKey()).normalize();
        if (!path.startsWith(directory) || !Files.isRegularFile(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(photo.getContentType()))
                .cacheControl(CacheControl.noStore()).header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(path));
    }
}

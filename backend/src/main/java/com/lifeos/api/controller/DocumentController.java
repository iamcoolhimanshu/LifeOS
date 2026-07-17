package com.lifeos.api.controller;

import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.model.Document;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.DocumentService;
import com.lifeos.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<Document>> getUserDocuments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(documentService.getUserDocuments(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(documentService.getDocumentForUser(user, id));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("file") MultipartFile file) {
        User user = getAuthenticatedUser(userDetails);
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: File is empty."));
        }

        try {
            Document doc = documentService.uploadDocument(user, file);
            activityLogService.logActivity(user, "DOCUMENT_UPLOAD", "Uploaded document: " + doc.getFileName());
            return ResponseEntity.ok(doc);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new MessageResponse("Error uploading file: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Document doc = documentService.getDocumentForUser(user, id);

        try {
            Path filePath = Paths.get(doc.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = doc.getFileType();
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(404).body(new MessageResponse("Error: File not found or unreadable."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Error downloading file: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Document doc = documentService.getDocumentForUser(user, id);

        try {
            documentService.deleteDocument(user, id);
            activityLogService.logActivity(user, "DOCUMENT_DELETE", "Deleted document: " + doc.getFileName());
            return ResponseEntity.ok(new MessageResponse("Document deleted successfully."));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new MessageResponse("Error deleting file from storage: " + e.getMessage()));
        }
    }
}

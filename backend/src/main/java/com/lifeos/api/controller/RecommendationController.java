package com.lifeos.api.controller;

import com.lifeos.api.dto.RecommendationDTO;
import com.lifeos.api.model.*;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private UserService userService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private DocumentService documentService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<RecommendationDTO>> getRecommendations(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("id") Long id,
            @RequestParam("type") String type) {
        
        User user = getAuthenticatedUser(userDetails);
        
        List<Note> notes = noteService.getActiveNotes(user);
        List<Document> documents = documentService.getUserDocuments(user);

        // Find reference item
        String refTitle = "";
        String refCategory = "";
        Set<String> refTags = new HashSet<>();

        if ("note".equalsIgnoreCase(type)) {
            Note refNote = notes.stream().filter(n -> n.getId().equals(id)).findFirst().orElse(null);
            if (refNote != null) {
                refTitle = refNote.getTitle();
                refCategory = refNote.getCategory();
                refTags = parseTags(refNote.getTags());
            }
        } else {
            Document refDoc = documents.stream().filter(d -> d.getId().equals(id)).findFirst().orElse(null);
            if (refDoc != null) {
                refTitle = refDoc.getFileName();
                refCategory = refDoc.getAiCategory();
                refTags = parseTags(refDoc.getAiTags());
            }
        }

        if (refTitle.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        final String finalRefTitle = refTitle;
        final String finalRefCategory = refCategory;
        final Set<String> finalRefTags = refTags;

        class ScoredItem {
            RecommendationDTO dto;
            int score;

            ScoredItem(RecommendationDTO dto, int score) {
                this.dto = dto;
                this.score = score;
            }
        }

        List<ScoredItem> scoredItems = new ArrayList<>();

        // Score notes
        for (Note note : notes) {
            if ("note".equalsIgnoreCase(type) && note.getId().equals(id)) continue;
            
            int score = 0;
            List<String> reasons = new ArrayList<>();

            // 1. Shared category
            if (finalRefCategory != null && finalRefCategory.equalsIgnoreCase(note.getCategory())) {
                score += 2;
                reasons.add("Shared Category (" + note.getCategory() + ")");
            }

            // 2. Shared tags
            Set<String> noteTags = parseTags(note.getTags());
            long commonTagsCount = noteTags.stream().filter(finalRefTags::contains).count();
            if (commonTagsCount > 0) {
                score += (commonTagsCount * 3);
                reasons.add(commonTagsCount + " matching tags");
            }

            // 3. Keyword matches in titles
            long commonKeywords = extractKeywords(finalRefTitle).stream()
                    .filter(k -> extractKeywords(note.getTitle()).contains(k)).count();
            if (commonKeywords > 0) {
                score += commonKeywords;
                reasons.add("Keyword matches in titles");
            }

            if (score > 0) {
                String reason = String.join(", ", reasons);
                scoredItems.add(new ScoredItem(
                    new RecommendationDTO("note_" + note.getId(), note.getTitle(), "note", note.getCategory(), reason),
                    score
                ));
            }
        }

        // Score documents
        for (Document doc : documents) {
            if ("document".equalsIgnoreCase(type) && doc.getId().equals(id)) continue;
            
            int score = 0;
            List<String> reasons = new ArrayList<>();

            // 1. Shared category
            if (finalRefCategory != null && finalRefCategory.equalsIgnoreCase(doc.getAiCategory())) {
                score += 2;
                reasons.add("Shared Category (" + doc.getAiCategory() + ")");
            }

            // 2. Shared tags
            Set<String> docTags = parseTags(doc.getAiTags());
            long commonTagsCount = docTags.stream().filter(finalRefTags::contains).count();
            if (commonTagsCount > 0) {
                score += (commonTagsCount * 3);
                reasons.add(commonTagsCount + " matching tags");
            }

            // 3. Keyword matches in titles
            long commonKeywords = extractKeywords(finalRefTitle).stream()
                    .filter(k -> extractKeywords(doc.getFileName()).contains(k)).count();
            if (commonKeywords > 0) {
                score += commonKeywords;
                reasons.add("Keyword matches in titles");
            }

            if (score > 0) {
                String reason = String.join(", ", reasons);
                scoredItems.add(new ScoredItem(
                    new RecommendationDTO("doc_" + doc.getId(), doc.getFileName(), "document", doc.getAiCategory(), reason),
                    score
                ));
            }
        }

        // Sort by score descending and return top 5
        List<RecommendationDTO> results = scoredItems.stream()
                .sorted((a, b) -> Integer.compare(b.score, a.score))
                .limit(5)
                .map(item -> item.dto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    private Set<String> extractKeywords(String title) {
        if (title == null) return Collections.emptySet();
        Set<String> keywords = new HashSet<>();
        String[] words = title.toLowerCase().split("[^a-zA-Z0-9]+");
        for (String w : words) {
            if (w.length() > 3) {
                keywords.add(w);
            }
        }
        return keywords;
    }

    private Set<String> parseTags(String tagsString) {
        if (tagsString == null || tagsString.trim().isEmpty()) return Collections.emptySet();
        Set<String> tags = new HashSet<>();
        String[] split = tagsString.toLowerCase().split(",");
        for (String s : split) {
            String tag = s.trim();
            if (!tag.isEmpty()) {
                tags.add(tag);
            }
        }
        return tags;
    }
}

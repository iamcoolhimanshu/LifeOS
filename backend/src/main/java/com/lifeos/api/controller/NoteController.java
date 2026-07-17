package com.lifeos.api.controller;

import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.dto.NoteDTO;
import com.lifeos.api.model.Note;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.NoteService;
import com.lifeos.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<Note>> getActiveNotes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(noteService.getActiveNotes(user));
    }

    @GetMapping("/archived")
    public ResponseEntity<List<Note>> getArchivedNotes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(noteService.getArchivedNotes(user));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<Note>> getFavoriteNotes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(noteService.getFavoriteNotes(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(noteService.getNoteForUser(user, id));
    }

    @PostMapping
    public ResponseEntity<Note> createNote(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody NoteDTO noteDTO) {
        User user = getAuthenticatedUser(userDetails);
        Note note = noteService.createNote(
                user,
                noteDTO.getTitle(),
                noteDTO.getContent(),
                noteDTO.getCategory(),
                noteDTO.getTags()
        );
        activityLogService.logActivity(user, "NOTE_CREATE", "Created note: " + note.getTitle());
        return ResponseEntity.ok(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody NoteDTO noteDTO) {
        User user = getAuthenticatedUser(userDetails);
        Note note = noteService.updateNote(
                user,
                id,
                noteDTO.getTitle(),
                noteDTO.getContent(),
                noteDTO.getCategory(),
                noteDTO.getTags()
        );
        activityLogService.logActivity(user, "NOTE_UPDATE", "Updated note: " + note.getTitle());
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Note note = noteService.getNoteForUser(user, id);
        noteService.deleteNote(user, id);
        activityLogService.logActivity(user, "NOTE_DELETE", "Deleted note: " + note.getTitle());
        return ResponseEntity.ok(new MessageResponse("Note deleted successfully."));
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<Note> togglePin(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Note note = noteService.togglePin(user, id);
        activityLogService.logActivity(user, "NOTE_TOGGLE_PIN", "Toggled pin status on: " + note.getTitle() + " (pinned: " + note.isPinned() + ")");
        return ResponseEntity.ok(note);
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Note> toggleArchive(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Note note = noteService.toggleArchive(user, id);
        activityLogService.logActivity(user, "NOTE_TOGGLE_ARCHIVE", "Toggled archive status on: " + note.getTitle() + " (archived: " + note.isArchived() + ")");
        return ResponseEntity.ok(note);
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<Note> toggleFavorite(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Note note = noteService.toggleFavorite(user, id);
        activityLogService.logActivity(user, "NOTE_TOGGLE_FAVORITE", "Toggled favorite status on: " + note.getTitle() + " (favorite: " + note.isFavorite() + ")");
        return ResponseEntity.ok(note);
    }

    @PostMapping("/{id}/enhance")
    public ResponseEntity<Note> runAIEnhance(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Note note = noteService.runManualAIEnhance(user, id);
        activityLogService.logActivity(user, "NOTE_AI_ENHANCE", "Manually triggered AI tags/summaries on: " + note.getTitle());
        return ResponseEntity.ok(note);
    }
}

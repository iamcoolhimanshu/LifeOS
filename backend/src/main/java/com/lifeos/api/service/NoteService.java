package com.lifeos.api.service;

import com.lifeos.api.model.Note;
import com.lifeos.api.model.User;
import com.lifeos.api.model.Task;
import com.lifeos.api.repository.NoteRepository;
import com.lifeos.api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AIService aiService;

    @Transactional
    public Note createNote(User user, String title, String content, String category, String tags) {
        Note note = new Note();
        note.setUser(user);
        note.setTitle(title);
        note.setContent(content);
        note.setCategory(category != null ? category : "Personal");
        note.setTags(tags != null ? tags : "");
        
        // Auto-Generate AI contents
        if (content != null && !content.trim().isEmpty()) {
            note.setAiSummary(aiService.generateSummary(title, content));
            if (category == null || category.trim().isEmpty()) {
                note.setCategory(aiService.categorizeContent(title, content));
            }
            if (tags == null || tags.trim().isEmpty()) {
                note.setTags(aiService.generateTags(title, content));
            }
        }
        
        Note savedNote = noteRepository.save(note);
        extractTasksFromNoteContent(user, content, savedNote.getCategory());
        return savedNote;
    }

    @Transactional
    public Note updateNote(User user, Long noteId, String title, String content, String category, String tags) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this note.");
        }

        note.setTitle(title);
        note.setContent(content);
        if (category != null) note.setCategory(category);
        if (tags != null) note.setTags(tags);

        // Regenerate AI Summary if content changed
        if (content != null && !content.trim().isEmpty()) {
            note.setAiSummary(aiService.generateSummary(title, content));
            if (category == null || category.trim().isEmpty() || "Personal".equalsIgnoreCase(category)) {
                note.setCategory(aiService.categorizeContent(title, content));
            }
            if (tags == null || tags.trim().isEmpty()) {
                note.setTags(aiService.generateTags(title, content));
            }
        }

        Note savedNote = noteRepository.save(note);
        extractTasksFromNoteContent(user, content, savedNote.getCategory());
        return savedNote;
    }

    @Transactional
    public Note togglePin(User user, Long noteId) {
        Note note = getNoteForUser(user, noteId);
        note.setPinned(!note.isPinned());
        return noteRepository.save(note);
    }

    @Transactional
    public Note toggleArchive(User user, Long noteId) {
        Note note = getNoteForUser(user, noteId);
        note.setArchived(!note.isArchived());
        // Unpin if archived
        if (note.isArchived()) {
            note.setPinned(false);
        }
        return noteRepository.save(note);
    }

    @Transactional
    public Note toggleFavorite(User user, Long noteId) {
        Note note = getNoteForUser(user, noteId);
        note.setFavorite(!note.isFavorite());
        return noteRepository.save(note);
    }

    @Transactional
    public Note runManualAIEnhance(User user, Long noteId) {
        Note note = getNoteForUser(user, noteId);
        if (note.getContent() != null && !note.getContent().trim().isEmpty()) {
            note.setAiSummary(aiService.generateSummary(note.getTitle(), note.getContent()));
            note.setCategory(aiService.categorizeContent(note.getTitle(), note.getContent()));
            note.setTags(aiService.generateTags(note.getTitle(), note.getContent()));
        }
        return noteRepository.save(note);
    }

    public List<Note> getActiveNotes(User user) {
        return noteRepository.findByUserAndArchivedFalseOrderByPinnedDescUpdatedAtDesc(user);
    }

    public List<Note> getArchivedNotes(User user) {
        return noteRepository.findByUserAndArchivedTrueOrderByUpdatedAtDesc(user);
    }

    public List<Note> getFavoriteNotes(User user) {
        return noteRepository.findByUserAndFavoriteTrueAndArchivedFalseOrderByUpdatedAtDesc(user);
    }

    public List<Note> getRecentActiveNotes(User user) {
        return noteRepository.findTop5ByUserAndArchivedFalseOrderByUpdatedAtDesc(user);
    }

    public Note getNoteForUser(User user, Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this note.");
        }
        return note;
    }

    @Transactional
    public void deleteNote(User user, Long noteId) {
        Note note = getNoteForUser(user, noteId);
        noteRepository.delete(note);
    }

    private void extractTasksFromNoteContent(User user, String content, String category) {
        if (content == null || content.trim().isEmpty()) return;

        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            String taskTitle = null;

            if (trimmed.startsWith("- [ ]")) {
                taskTitle = trimmed.substring(5).trim();
            } else if (trimmed.toLowerCase().startsWith("todo:")) {
                taskTitle = trimmed.substring(5).trim();
            } else if (trimmed.toLowerCase().startsWith("task:")) {
                taskTitle = trimmed.substring(5).trim();
            }

            if (taskTitle != null && !taskTitle.isEmpty()) {
                final String finalTitle = taskTitle;
                List<Task> existing = taskRepository.findByUserAndStatusOrderByDueDateAsc(user, "TODO");
                boolean duplicate = existing.stream().anyMatch(t -> t.getTitle().equalsIgnoreCase(finalTitle));

                if (!duplicate) {
                    Task task = new Task(
                        user,
                        taskTitle,
                        "Automatically extracted from note content.",
                        null,
                        "MEDIUM",
                        "TODO",
                        category != null ? category : "Personal"
                    );
                    taskRepository.save(task);
                }
            }
        }
    }
}

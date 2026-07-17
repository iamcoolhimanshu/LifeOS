package com.lifeos.api.service;

import com.lifeos.api.dto.UniversalSearchResult;
import com.lifeos.api.model.*;
import com.lifeos.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class SearchService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private LearningRepository learningRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<UniversalSearchResult> searchUserBrain(User user, String query) {
        List<UniversalSearchResult> results = new ArrayList<>();

        if (query == null || query.trim().isEmpty()) {
            return results;
        }

        String trimmedQuery = query.trim();

        // 1. Search Notes
        List<Note> notes = noteRepository.searchNotes(user, trimmedQuery);
        for (Note note : notes) {
            String snippet = generateSnippet(note.getContent(), trimmedQuery);
            results.add(new UniversalSearchResult(
                    "NOTE",
                    note.getId(),
                    note.getTitle(),
                    note.getCategory(),
                    note.getTags(),
                    snippet,
                    note.getAiSummary()
            ));
        }

        // 2. Search Documents
        List<Document> documents = documentRepository.searchDocuments(user, trimmedQuery);
        for (Document doc : documents) {
            String snippet = generateSnippet(doc.getExtractedText(), trimmedQuery);
            results.add(new UniversalSearchResult(
                    "DOCUMENT",
                    doc.getId(),
                    doc.getFileName(),
                    doc.getAiCategory(),
                    doc.getAiTags(),
                    snippet,
                    doc.getAiSummary()
            ));
        }

        // 3. Search Events
        List<Event> events = eventRepository.searchEvents(user, trimmedQuery);
        for (Event event : events) {
            results.add(new UniversalSearchResult(
                    "EVENT",
                    event.getId(),
                    event.getTitle(),
                    event.getCategory(),
                    null,
                    event.getDescription(),
                    null
            ));
        }

        // 4. Search Tasks
        List<Task> tasks = taskRepository.searchTasks(user, trimmedQuery);
        for (Task task : tasks) {
            results.add(new UniversalSearchResult(
                    "TASK",
                    task.getId(),
                    task.getTitle(),
                    task.getCategory(),
                    task.getPriority() + " / " + task.getStatus(),
                    task.getDescription(),
                    null
            ));
        }

        // 5. Search Goals
        List<Goal> goals = goalRepository.searchGoals(user, trimmedQuery);
        for (Goal goal : goals) {
            results.add(new UniversalSearchResult(
                    "GOAL",
                    goal.getId(),
                    goal.getTitle(),
                    goal.getCategory(),
                    goal.getStatus() + " (" + goal.getProgress() + "%)",
                    goal.getDescription(),
                    null
            ));
        }

        // 6. Search Learnings
        List<Learning> learnings = learningRepository.searchLearnings(user, trimmedQuery);
        for (Learning learning : learnings) {
            results.add(new UniversalSearchResult(
                    "LEARNING",
                    learning.getId(),
                    learning.getTopic(),
                    learning.getStatus(),
                    "Progress: " + learning.getProgress() + "%",
                    learning.getNotes(),
                    null
            ));
        }

        // 7. Search Job Applications
        List<JobApplication> applications = jobApplicationRepository.searchCareers(user, trimmedQuery);
        for (JobApplication ja : applications) {
            results.add(new UniversalSearchResult(
                    "CAREER",
                    ja.getId(),
                    ja.getCompany() + " - " + ja.getRole(),
                    ja.getStatus(),
                    ja.getSalary(),
                    ja.getNotes(),
                    null
            ));
        }

        // 8. Search Transactions
        List<Transaction> transactions = transactionRepository.searchTransactions(user, trimmedQuery);
        for (Transaction t : transactions) {
            results.add(new UniversalSearchResult(
                    "TRANSACTION",
                    t.getId(),
                    t.getDescription(),
                    t.getCategory(),
                    t.getType() + " - $" + t.getAmount(),
                    "Date: " + t.getDate(),
                    null
            ));
        }

        return results;
    }

    private String generateSnippet(String text, String query) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        String lowerText = text.toLowerCase();
        String lowerQuery = query.toLowerCase();
        int index = lowerText.indexOf(lowerQuery);

        if (index == -1) {
            // If query not found (e.g. matched title or tag), return start of text
            return text.substring(0, Math.min(text.length(), 160)) + (text.length() > 160 ? "..." : "");
        }

        // Get window around match
        int start = Math.max(0, index - 60);
        int end = Math.min(text.length(), index + query.length() + 80);

        String prefix = start > 0 ? "..." : "";
        String suffix = end < text.length() ? "..." : "";

        return prefix + text.substring(start, end).replace("\n", " ").trim() + suffix;
    }
}

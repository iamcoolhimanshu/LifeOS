package com.lifeos.api.controller;

import com.lifeos.api.dto.ChatRequest;
import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.dto.UniversalSearchResult;
import com.lifeos.api.model.*;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private UserService userService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private AIService aiService;

    @Autowired
    private EventService eventService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private LearningService learningService;

    @Autowired
    private JobApplicationService jobApplicationService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<UniversalSearchResult>> search(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("q") String query) {
        User user = getAuthenticatedUser(userDetails);
        
        List<UniversalSearchResult> results = searchService.searchUserBrain(user, query);
        activityLogService.logActivity(user, "UNIVERSAL_SEARCH", "Searched query: " + query + " (found " + results.size() + " matches)");
        return ResponseEntity.ok(results);
    }

    @PostMapping("/chat")
    public ResponseEntity<MessageResponse> askAIChatbot(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ChatRequest chatRequest) {
        User user = getAuthenticatedUser(userDetails);
        String question = chatRequest.getQuestion();

        List<String> contextSnippets = new ArrayList<>();

        // 1. Notes & Documents Context
        List<Note> activeNotes = noteService.getActiveNotes(user);
        for (Note note : activeNotes) {
            String summary = note.getAiSummary() != null ? note.getAiSummary() : "";
            contextSnippets.add("Note Title: " + note.getTitle() + " | Category: " + note.getCategory() + 
                                " | Tags: " + note.getTags() + " | Content: " + note.getContent() + " | Summary: " + summary);
        }

        List<Document> documents = documentService.getUserDocuments(user);
        for (Document doc : documents) {
            String summary = doc.getAiSummary() != null ? doc.getAiSummary() : "";
            contextSnippets.add("Document File: " + doc.getFileName() + " | Category: " + doc.getAiCategory() + 
                                " | Tags: " + doc.getAiTags() + " | Content: " + doc.getExtractedText() + " | Summary: " + summary);
        }

        // 2. Events Context
        List<Event> events = eventService.getEventsForUser(user);
        for (Event event : events) {
            contextSnippets.add("Calendar Event: " + event.getTitle() + " | Category: " + event.getCategory() + 
                                " | Time: " + event.getStartTime() + " to " + event.getEndTime() + " | Description: " + event.getDescription());
        }

        // 3. Tasks Context
        List<Task> tasks = taskService.getTasksForUser(user);
        for (Task task : tasks) {
            contextSnippets.add("Task: " + task.getTitle() + " | Category: " + task.getCategory() + 
                                " | Priority: " + task.getPriority() + " | Status: " + task.getStatus() + " | Due Date: " + task.getDueDate() + " | Description: " + task.getDescription());
        }

        // 4. Goals Context
        List<Goal> goals = goalService.getGoalsForUser(user);
        for (Goal goal : goals) {
            contextSnippets.add("Goal: " + goal.getTitle() + " | Category: " + goal.getCategory() + 
                                " | Status: " + goal.getStatus() + " | Progress: " + goal.getProgress() + "% | Target Date: " + goal.getTargetDate() + " | Description: " + goal.getDescription());
        }

        // 5. Learnings Context
        List<Learning> learnings = learningService.getLearningsForUser(user);
        for (Learning l : learnings) {
            contextSnippets.add("Learning Topic: " + l.getTopic() + " | Source: " + l.getSource() + 
                                " | Status: " + l.getStatus() + " | Progress: " + l.getProgress() + "% | Notes: " + l.getNotes());
        }

        // 6. Careers Context
        List<JobApplication> jobs = jobApplicationService.getApplicationsForUser(user);
        for (JobApplication job : jobs) {
            contextSnippets.add("Career Application: " + job.getRole() + " at " + job.getCompany() + 
                                " | Status: " + job.getStatus() + " | Salary: " + job.getSalary() + " | Link: " + job.getUrl() + " | Notes: " + job.getNotes());
        }

        // 7. Finances Context
        List<Transaction> transactions = transactionService.getTransactionsForUser(user);
        for (Transaction t : transactions) {
            contextSnippets.add("Financial Transaction: " + t.getDescription() + " | Category: " + t.getCategory() + 
                                " | Type: " + t.getType() + " | Amount: $" + t.getAmount() + " | Date: " + t.getDate());
        }

        if (contextSnippets.isEmpty()) {
            contextSnippets.add("No data has been added by the user yet.");
        }

        // Query the AI Service
        String answer = aiService.answerChatQuestion(question, contextSnippets);
        activityLogService.logActivity(user, "AI_CHAT_QUERY", "Asked chatbot: " + (question.length() > 60 ? question.substring(0, 57) + "..." : question));

        return ResponseEntity.ok(new MessageResponse(answer));
    }
}

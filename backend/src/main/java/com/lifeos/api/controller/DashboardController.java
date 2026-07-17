package com.lifeos.api.controller;

import com.lifeos.api.dto.DashboardSummary;
import com.lifeos.api.model.ActivityLog;
import com.lifeos.api.model.Document;
import com.lifeos.api.model.Note;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.DocumentService;
import com.lifeos.api.service.NoteService;
import com.lifeos.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private UserService userService;

    private static final String[] MOTIVATIONAL_QUOTES = {
        "The best way to predict the future is to invent it. – Alan Kay",
        "Your mind is for having ideas, not holding them. – David Allen",
        "Simplicity is the soul of efficiency. – Austin Freeman",
        "Before software can be reusable it first has to be usable. – Ralph Johnson",
        "Make it work, make it right, make it fast. – Kent Beck",
        "Knowledge is power, but sharing it is the superpower. – Unknown",
        "The only way to do great work is to love what you do. – Steve Jobs",
        "Focus on being productive instead of busy. – Tim Ferriss",
        "It is not that we have a short time to live, but that we waste a lot of it. – Seneca",
        "Be govern'd by your soul, not by your habits. – Thomas Traherne",
        "Amateurs sit and wait for inspiration, the rest of us just get up and go to work. – Stephen King",
        "Action is the foundational key to all success. – Pablo Picasso",
        "If you cannot do great things, do small things in a great way. – Napoleon Hill",
        "The secret of getting ahead is getting started. – Mark Twain",
        "Quality is not an act, it is a habit. – Aristotle",
        "There is no substitute for hard work. – Thomas Edison",
        "The path to success is to take massive, focused action. – Tony Robbins",
        "Do not count the days, make the days count. – Muhammad Ali",
        "Believe you can and you're halfway there. – Theodore Roosevelt",
        "You miss 100% of the shots you don't take. – Wayne Gretzky"
    };

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getDashboardSummary(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);

        // Fetch counts and recent entities
        List<Note> activeNotes = noteService.getActiveNotes(user);
        long totalNotes = activeNotes.size();
        List<Note> recentNotes = noteService.getRecentActiveNotes(user);

        List<Document> documents = documentService.getUserDocuments(user);
        long totalDocs = documents.size();
        List<Document> recentDocs = documentService.getRecentDocuments(user);

        List<ActivityLog> logs = activityLogService.getRecentLogs(user);

        // Calculate productivity score dynamically
        int productivityScore = calculateProductivityScore(logs);

        // Fetch quote of the day based on day of month
        String dailyQuote = getQuoteOfTheDay();

        DashboardSummary summary = new DashboardSummary(
                totalNotes,
                totalDocs,
                recentNotes,
                recentDocs,
                logs,
                productivityScore,
                dailyQuote
        );

        return ResponseEntity.ok(summary);
    }

    private int calculateProductivityScore(List<ActivityLog> logs) {
        int score = 40; // Base score
        int noteCreates = 0;
        int noteUpdates = 0;
        int docUploads = 0;

        for (ActivityLog log : logs) {
            String action = log.getAction();
            if ("NOTE_CREATE".equals(action)) noteCreates++;
            else if ("NOTE_UPDATE".equals(action)) noteUpdates++;
            else if ("DOCUMENT_UPLOAD".equals(action)) docUploads++;
        }

        // Score caps: max 3 creates (+15), max 3 updates (+15), max 2 uploads (+20), login activity (+10)
        score += Math.min(noteCreates, 3) * 5;
        score += Math.min(noteUpdates, 3) * 5;
        score += Math.min(docUploads, 2) * 10;
        if (!logs.isEmpty()) {
            score += 10; // Logged activity boost
        }

        return Math.min(100, score);
    }

    private String getQuoteOfTheDay() {
        long epochDay = java.time.LocalDate.now().toEpochDay();
        int index = (int) (epochDay % MOTIVATIONAL_QUOTES.length);
        return MOTIVATIONAL_QUOTES[index];
    }
}

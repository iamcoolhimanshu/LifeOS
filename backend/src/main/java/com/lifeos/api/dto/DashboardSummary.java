package com.lifeos.api.dto;

import com.lifeos.api.model.ActivityLog;
import com.lifeos.api.model.Document;
import com.lifeos.api.model.Note;
import java.util.List;

public class DashboardSummary {
    private long totalNotes;
    private long totalDocuments;
    private List<Note> recentNotes;
    private List<Document> recentDocuments;
    private List<ActivityLog> timeline;
    private int productivityScore;
    private String dailyQuote;

    public DashboardSummary(long totalNotes, long totalDocuments, List<Note> recentNotes,
                            List<Document> recentDocuments, List<ActivityLog> timeline,
                            int productivityScore, String dailyQuote) {
        this.totalNotes = totalNotes;
        this.totalDocuments = totalDocuments;
        this.recentNotes = recentNotes;
        this.recentDocuments = recentDocuments;
        this.timeline = timeline;
        this.productivityScore = productivityScore;
        this.dailyQuote = dailyQuote;
    }

    // Getters and Setters
    public long getTotalNotes() { return totalNotes; }
    public void setTotalNotes(long totalNotes) { this.totalNotes = totalNotes; }

    public long getTotalDocuments() { return totalDocuments; }
    public void setTotalDocuments(long totalDocuments) { this.totalDocuments = totalDocuments; }

    public List<Note> getRecentNotes() { return recentNotes; }
    public void setRecentNotes(List<Note> recentNotes) { this.recentNotes = recentNotes; }

    public List<Document> getRecentDocuments() { return recentDocuments; }
    public void setRecentDocuments(List<Document> recentDocuments) { this.recentDocuments = recentDocuments; }

    public List<ActivityLog> getTimeline() { return timeline; }
    public void setTimeline(List<ActivityLog> timeline) { this.timeline = timeline; }

    public int getProductivityScore() { return productivityScore; }
    public void setProductivityScore(int productivityScore) { this.productivityScore = productivityScore; }

    public String getDailyQuote() { return dailyQuote; }
    public void setDailyQuote(String dailyQuote) { this.dailyQuote = dailyQuote; }
}

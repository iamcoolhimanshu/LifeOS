package com.lifeos.api.dto;

public class UniversalSearchResult {
    private String type; // "NOTE" or "DOCUMENT"
    private Long id;
    private String title;
    private String category;
    private String tags;
    private String snippet;
    private String aiSummary;

    public UniversalSearchResult(String type, Long id, String title, String category, String tags, String snippet, String aiSummary) {
        this.type = type;
        this.id = id;
        this.title = title;
        this.category = category;
        this.tags = tags;
        this.snippet = snippet;
        this.aiSummary = aiSummary;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
}

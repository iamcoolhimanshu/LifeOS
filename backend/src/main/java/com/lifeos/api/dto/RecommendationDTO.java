package com.lifeos.api.dto;

public class RecommendationDTO {
    private String id;
    private String title;
    private String type;
    private String category;
    private String matchReason;

    public RecommendationDTO(String id, String title, String type, String category, String matchReason) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.category = category;
        this.matchReason = matchReason;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
}

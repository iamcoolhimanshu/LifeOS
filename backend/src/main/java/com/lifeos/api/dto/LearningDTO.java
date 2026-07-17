package com.lifeos.api.dto;

import jakarta.validation.constraints.NotBlank;

public class LearningDTO {
    @NotBlank
    private String topic;

    private String source;
    private String status;
    private int progress;
    private String notes;

    // Getters and Setters
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

package com.lifeos.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AIService {
    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    @Value("${lifeos.ai.provider}")
    private String provider;

    @Value("${lifeos.ai.groq.api-key:}")
    private String groqApiKey;

    @Autowired
    private com.lifeos.api.repository.UserRepository userRepository;

    @Autowired
    private com.lifeos.api.repository.UserConfigurationRepository userConfigurationRepository;

    @Autowired
    private OAuthTokenEncryptionService encryptionService;

    private String resolveApiKey() {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.lifeos.api.security.UserDetailsImpl) {
                com.lifeos.api.security.UserDetailsImpl details = (com.lifeos.api.security.UserDetailsImpl) auth.getPrincipal();
                java.util.Optional<com.lifeos.api.model.UserConfiguration> configOpt = userConfigurationRepository.findByUser(
                        userRepository.findById(details.getId()).orElse(null)
                );
                if (configOpt.isPresent()) {
                    com.lifeos.api.model.UserConfiguration config = configOpt.get();
                    if (config.getEncryptedAiApiKey() != null && !config.getEncryptedAiApiKey().isEmpty()) {
                        return encryptionService.decrypt(config.getEncryptedAiApiKey());
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to dynamically resolve AI api key from user security context, falling back to application defaults: {}", e.getMessage());
        }
        return this.groqApiKey;
    }

    private String resolveProvider() {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.lifeos.api.security.UserDetailsImpl) {
                com.lifeos.api.security.UserDetailsImpl details = (com.lifeos.api.security.UserDetailsImpl) auth.getPrincipal();
                java.util.Optional<com.lifeos.api.model.UserConfiguration> configOpt = userConfigurationRepository.findByUser(
                        userRepository.findById(details.getId()).orElse(null)
                );
                if (configOpt.isPresent()) {
                    com.lifeos.api.model.UserConfiguration config = configOpt.get();
                    if (config.getAiProvider() != null && !config.getAiProvider().isEmpty()) {
                        return config.getAiProvider();
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to dynamically resolve AI provider from user security context, falling back to application defaults: {}", e.getMessage());
        }
        return this.provider;
    }

    /**
     * Generates a summary for a given text content.
     */
    public String generateSummary(String title, String content) {
        String activeProvider = resolveProvider();
        if ("mock".equalsIgnoreCase(activeProvider) || content == null || content.trim().isEmpty()) {
            return generateMockSummary(title, content);
        }
        
        try {
            logger.info("Calling real AI provider: {}", activeProvider);
            return callExternalAIService("Summarize this content in 2-3 concise paragraphs, focusing on core actionable insights. Title: " + title + "\n\nContent:\n" + content);
        } catch (Exception e) {
            logger.error("Failed to fetch live AI summary, falling back to mock: {}", e.getMessage());
            return generateMockSummary(title, content);
        }
    }

    /**
     * Generates tags for a given text content.
     */
    public String generateTags(String title, String content) {
        String activeProvider = resolveProvider();
        if ("mock".equalsIgnoreCase(activeProvider) || content == null || content.trim().isEmpty()) {
            return generateMockTags(title, content);
        }
        
        try {
            logger.info("Calling real AI provider: {}", activeProvider);
            String rawTags = callExternalAIService("Based on the following content, return only a comma-separated list of 3 to 5 lowercase keywords or tags. Do not output anything else. Title: " + title + "\n\nContent:\n" + content);
            return sanitizeTags(rawTags);
        } catch (Exception e) {
            logger.error("Failed to fetch live AI tags, falling back to mock: {}", e.getMessage());
            return generateMockTags(title, content);
        }
    }

    /**
     * Categorizes the content into pre-defined categories.
     */
    public String categorizeContent(String title, String content) {
        String activeProvider = resolveProvider();
        if ("mock".equalsIgnoreCase(activeProvider) || content == null || content.trim().isEmpty()) {
            return generateMockCategory(title, content);
        }
        
        try {
            logger.info("Calling real AI provider: {}", activeProvider);
            return callExternalAIService("Based on the following content, categorize it into exactly one of these: Personal, Work, Finance, Learning, Health, Career, Tasks. Return ONLY the category name. Title: " + title + "\n\nContent:\n" + content);
        } catch (Exception e) {
            logger.error("Failed to fetch live AI category, falling back to mock: {}", e.getMessage());
            return generateMockCategory(title, content);
        }
    }

    /**
     * Answers a chat question based on user context notes/documents.
     */
    public String answerChatQuestion(String question, List<String> contextSnippets) {
        StringBuilder context = new StringBuilder();
        for (String snippet : contextSnippets) {
            context.append("- ").append(snippet).append("\n");
        }

        String activeProvider = resolveProvider();
        if ("mock".equalsIgnoreCase(activeProvider) || contextSnippets.isEmpty()) {
            return generateMockChatResponse(question, context.toString());
        }

        try {
            logger.info("Calling real AI provider for chat: {}", activeProvider);
            String prompt = "You are LifeOS, the user's Personal Digital Brain assistant. Answer the user's question using their personal notes and documents context below. If the context doesn't contain the answer, politely tell them based on their data you couldn't find it, but offer a general helpful answer.\n\nContext:\n" + context.toString() + "\nQuestion: " + question;
            return callExternalAIService(prompt);
        } catch (Exception e) {
            logger.error("Failed to fetch live AI chat response, falling back to mock: {}", e.getMessage());
            return generateMockChatResponse(question, context.toString());
        }
    }

    // --- Mock Generators ---

    private String generateMockSummary(String title, String content) {
        if (content == null || content.trim().isEmpty()) {
            return "No content available to summarize.";
        }
        int wordCount = content.split("\\s+").length;
        String preview = content.substring(0, Math.min(content.length(), 150)) + "...";
        
        return "### AI Summary\n" +
                "This document titled **\"" + title + "\"** contains approximately " + wordCount + " words.\n\n" +
                "**Key Themes Identified:**\n" +
                "- Core concept relates to '" + title + "'.\n" +
                "- Overview snippet: *" + preview.replace("\n", " ") + "*\n\n" +
                "*(Note: Running in LifeOS Mock AI mode. Provide a valid Groq API key in application.properties for real semantic summaries.)*";
    }

    private String generateMockTags(String title, String content) {
        String combined = (title + " " + content).toLowerCase(Locale.ROOT);
        List<String> tags = new ArrayList<>();
        
        if (combined.contains("java") || combined.contains("spring") || combined.contains("code") || combined.contains("developer")) {
            tags.add("coding");
            tags.add("java");
        }
        if (combined.contains("resume") || combined.contains("cv") || combined.contains("job") || combined.contains("internship")) {
            tags.add("career");
            tags.add("job-application");
        }
        if (combined.contains("bill") || combined.contains("finance") || combined.contains("money") || combined.contains("expense") || combined.contains("invoice")) {
            tags.add("finance");
            tags.add("invoice");
        }
        if (combined.contains("health") || combined.contains("diet") || combined.contains("sleep") || combined.contains("workout") || combined.contains("doctor")) {
            tags.add("health");
            tags.add("wellness");
        }
        if (combined.contains("learn") || combined.contains("study") || combined.contains("course") || combined.contains("book")) {
            tags.add("learning");
            tags.add("education");
        }

        if (tags.isEmpty()) {
            tags.add("general");
            tags.add("personal");
        }

        return String.join(",", tags);
    }

    private String generateMockCategory(String title, String content) {
        String combined = (title + " " + content).toLowerCase(Locale.ROOT);
        if (combined.contains("resume") || combined.contains("cv") || combined.contains("interview") || combined.contains("job") || combined.contains("portfolio")) {
            return "Career";
        }
        if (combined.contains("bill") || combined.contains("invoice") || combined.contains("expense") || combined.contains("finance") || combined.contains("budget")) {
            return "Finance";
        }
        if (combined.contains("health") || combined.contains("sleep") || combined.contains("medicine") || combined.contains("workout") || combined.contains("calorie")) {
            return "Health";
        }
        if (combined.contains("learn") || combined.contains("study") || combined.contains("course") || combined.contains("book") || combined.contains("lecture")) {
            return "Learning";
        }
        if (combined.contains("project") || combined.contains("work") || combined.contains("meeting") || combined.contains("java") || combined.contains("spring")) {
            return "Work";
        }
        return "Personal";
    }

    private String generateMockChatResponse(String question, String context) {
        String query = question.toLowerCase(Locale.ROOT);
        
        if (context == null || context.trim().isEmpty() || context.contains("- No notes") || context.contains("- No documents")) {
            return "Hello! I am your **LifeOS AI Digital Brain**. I don't see any documents or notes uploaded yet.\n\n" +
                    "To get started, please **create a note** or **upload a file** (like your resume or expense reports) in the sidebar! Once you do, you can ask me to search, summarize, or cross-reference your files.";
        }

        // Search within mock context
        String contextLower = context.toLowerCase(Locale.ROOT);
        
        if (query.contains("resume") || query.contains("cv")) {
            if (contextLower.contains("resume") || contextLower.contains("cv")) {
                return "Yes, I found your **Resume** in your documents! Here is what I can extract:\n\n" +
                        "- Location: It appears to be stored under files list.\n" +
                        "- Summary: Based on your documents, you have career artifacts uploaded. Let me know if you want me to review it or generate custom interview questions for it!";
            } else {
                return "I searched your personal brain, but I couldn't find a **resume** or CV document. Try uploading a PDF/Word file containing your resume in the **Documents** section!";
            }
        }
        
        if (query.contains("java") || query.contains("internship") || query.contains("work")) {
            if (contextLower.contains("java") || contextLower.contains("intern") || contextLower.contains("work")) {
                return "Based on your **work and coding notes**:\n\n" +
                        "- You have records mentioning technology stacks (specifically Java / Spring Boot).\n" +
                        "- I recommend organizing your notes by tagging them `#java` for faster retrieval. Would you like me to rewrite or format your Java study guides?";
            }
        }

        if (query.contains("bill") || query.contains("invoice") || query.contains("expense") || query.contains("pending")) {
            if (contextLower.contains("bill") || contextLower.contains("invoice") || contextLower.contains("expense")) {
                return "Looking at your **financial uploads**:\n\n" +
                        "- You have documents tagged with financial summaries.\n" +
                        "- In Phase 2, we will enable automated expense analytics and custom budget trackers!";
            }
        }

        return "I received your question: *\"" + question + "\"*.\n\n" +
                "Here is what I found in your Digital Brain matching this query:\n" +
                "1. I analyzed your notes & files matching your search keywords.\n" +
                "2. Your recent notes indicate topics related to personal goals and productivity.\n\n" +
                "**Context Snippet matches found:**\n" +
                (context.length() > 300 ? context.substring(0, 300) + "..." : context) + "\n\n" +
                "*(LifeOS AI Chat Assistant running in Mock mode. Set up Groq in backend configuration to enable live responses.)*";
    }

    private String sanitizeTags(String rawTags) {
        if (rawTags == null) return "general";
        String clean = rawTags.replaceAll("[^a-zA-Z0-9,\\s-]", "").trim();
        String[] split = clean.split(",");
        List<String> valid = new ArrayList<>();
        for (String s : split) {
            String tag = s.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", "-");
            if (!tag.isEmpty()) {
                valid.add(tag);
            }
        }
        return valid.isEmpty() ? "general" : String.join(",", valid);
    }

    /**
     * Extracts text from an image utilizing Groq Llama 3.2 Vision Multi-modal model
     */
    public String extractTextFromImage(byte[] imageBytes, String fileType) {
        String activeProvider = resolveProvider();
        String activeKey = resolveApiKey();
        if ("mock".equalsIgnoreCase(activeProvider) || activeKey == null || activeKey.trim().isEmpty() || "mock-key".equalsIgnoreCase(activeKey)) {
            return "OCR text extraction [MOCK]: Scanned invoice / document text context.";
        }
        
        try {
            String base64Image = java.util.Base64.getEncoder().encodeToString(imageBytes);
            String dataUrl = "data:" + (fileType != null ? fileType : "image/jpeg") + ";base64," + base64Image;

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();

            String jsonPayload = "{"
                    + "\"model\": \"llama-3.2-11b-vision-preview\","
                    + "\"messages\": ["
                    + "  {"
                    + "    \"role\": \"user\","
                    + "    \"content\": ["
                    + "      {\"type\": \"text\", \"text\": \"Perform OCR text extraction on this image. Return ONLY the transcribed text in markdown. Maintain the format and layout. Do not write filler conversational text.\" },"
                    + "      {\"type\": \"image_url\", \"image_url\": {\"url\": \"" + dataUrl + "\"} }"
                    + "    ]"
                    + "  }"
                    + "],"
                    + "\"temperature\": 0.1"
                    + "}";

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.groq.com/openai/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + activeKey)
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String body = response.body();
                int contentStart = body.indexOf("\"content\":");
                if (contentStart != -1) {
                    int firstQuote = body.indexOf("\"", contentStart + 10);
                    int lastQuote = body.indexOf("\"", firstQuote + 1);
                    while (body.charAt(lastQuote - 1) == '\\') {
                        lastQuote = body.indexOf("\"", lastQuote + 1);
                    }
                    String rawContent = body.substring(firstQuote + 1, lastQuote);
                    return rawContent.replace("\\n", "\n")
                                     .replace("\\\"", "\"")
                                     .replace("\\\\", "\\");
                }
                return body;
            } else {
                throw new RuntimeException("Vision API error status " + response.statusCode());
            }
        } catch (Exception e) {
            logger.error("Vision OCR extraction failed, using mock data", e);
            return "OCR text extraction [MOCK FALLBACK]: Scanned invoice metadata context.";
        }
    }

    /**
     * Executes external HTTP REST calls to Groq API using standard Java 17 HttpClient.
     */
    public String callExternalAIService(String prompt) {
        String activeKey = resolveApiKey();
        if (activeKey == null || activeKey.trim().isEmpty() || "mock-key".equalsIgnoreCase(activeKey)) {
            throw new IllegalArgumentException("API key is invalid or not configured.");
        }
        
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            
            String escapedPrompt = prompt.replace("\\", "\\\\")
                                         .replace("\"", "\\\"")
                                         .replace("\n", "\\n")
                                         .replace("\r", "\\r")
                                         .replace("\t", "\\t");
            
            String jsonPayload = "{"
                    + "\"model\": \"llama-3.3-70b-versatile\","
                    + "\"messages\": [{\"role\": \"user\", \"content\": \"" + escapedPrompt + "\"}],"
                    + "\"temperature\": 0.2"
                    + "}";

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.groq.com/openai/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + activeKey)
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                String body = response.body();
                int contentStart = body.indexOf("\"content\":");
                if (contentStart != -1) {
                    int firstQuote = body.indexOf("\"", contentStart + 10);
                    int lastQuote = body.indexOf("\"", firstQuote + 1);
                    while (body.charAt(lastQuote - 1) == '\\') {
                        lastQuote = body.indexOf("\"", lastQuote + 1);
                    }
                    String rawContent = body.substring(firstQuote + 1, lastQuote);
                    return rawContent.replace("\\n", "\n")
                                     .replace("\\\"", "\"")
                                     .replace("\\\\", "\\");
                }
                return body;
            } else {
                throw new RuntimeException("Groq API returned HTTP status " + response.statusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Groq API: " + e.getMessage(), e);
        }
    }
}

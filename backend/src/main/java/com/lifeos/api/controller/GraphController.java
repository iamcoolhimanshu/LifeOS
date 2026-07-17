package com.lifeos.api.controller;

import com.lifeos.api.dto.GraphResponse;
import com.lifeos.api.model.*;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/graph")
public class GraphController {

    @Autowired
    private UserService userService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private EventService eventService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private LearningService learningService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<GraphResponse> getKnowledgeGraph(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);

        List<GraphResponse.Node> nodes = new ArrayList<>();
        List<GraphResponse.Link> links = new ArrayList<>();

        // Fetch user data
        List<Note> notes = noteService.getActiveNotes(user);
        List<Document> documents = documentService.getUserDocuments(user);
        List<Event> events = eventService.getEventsForUser(user);
        List<Task> tasks = taskService.getTasksForUser(user);
        List<Goal> goals = goalService.getGoalsForUser(user);
        List<Learning> learnings = learningService.getLearningsForUser(user);

        // Helper maps for keyword matching
        Map<String, Set<String>> itemKeywords = new HashMap<>();
        Map<String, Set<String>> itemTags = new HashMap<>();

        // 1. Add Note Nodes
        for (Note note : notes) {
            String nodeId = "note_" + note.getId();
            nodes.add(new GraphResponse.Node(nodeId, note.getTitle(), "note", note.getCategory()));
            itemKeywords.put(nodeId, extractKeywords(note.getTitle()));
            itemTags.put(nodeId, parseTags(note.getTags()));
        }

        // 2. Add Document Nodes
        for (Document doc : documents) {
            String nodeId = "doc_" + doc.getId();
            nodes.add(new GraphResponse.Node(nodeId, doc.getFileName(), "document", doc.getAiCategory()));
            itemKeywords.put(nodeId, extractKeywords(doc.getFileName()));
            itemTags.put(nodeId, parseTags(doc.getAiTags()));
        }

        // 3. Add Event Nodes
        for (Event event : events) {
            String nodeId = "event_" + event.getId();
            nodes.add(new GraphResponse.Node(nodeId, event.getTitle(), "event", event.getCategory()));
            itemKeywords.put(nodeId, extractKeywords(event.getTitle()));
            itemTags.put(nodeId, new HashSet<>());
        }

        // 4. Add Task Nodes
        for (Task task : tasks) {
            String nodeId = "task_" + task.getId();
            nodes.add(new GraphResponse.Node(nodeId, task.getTitle(), "task", task.getCategory()));
            itemKeywords.put(nodeId, extractKeywords(task.getTitle()));
            itemTags.put(nodeId, new HashSet<>());
        }

        // 5. Add Goal Nodes
        for (Goal goal : goals) {
            String nodeId = "goal_" + goal.getId();
            nodes.add(new GraphResponse.Node(nodeId, goal.getTitle(), "goal", goal.getCategory()));
            itemKeywords.put(nodeId, extractKeywords(goal.getTitle()));
            itemTags.put(nodeId, new HashSet<>());
        }

        // 6. Add Learning Nodes
        for (Learning learning : learnings) {
            String nodeId = "learning_" + learning.getId();
            nodes.add(new GraphResponse.Node(nodeId, learning.getTopic(), "learning", "Learning"));
            itemKeywords.put(nodeId, extractKeywords(learning.getTopic()));
            itemTags.put(nodeId, new HashSet<>());
        }

        // Compute Links (Connections) between nodes
        for (int i = 0; i < nodes.size(); i++) {
            GraphResponse.Node nodeA = nodes.get(i);
            String idA = nodeA.getId();
            Set<String> keywordsA = itemKeywords.getOrDefault(idA, Collections.emptySet());
            Set<String> tagsA = itemTags.getOrDefault(idA, Collections.emptySet());

            for (int j = i + 1; j < nodes.size(); j++) {
                GraphResponse.Node nodeB = nodes.get(j);
                String idB = nodeB.getId();
                Set<String> keywordsB = itemKeywords.getOrDefault(idB, Collections.emptySet());
                Set<String> tagsB = itemTags.getOrDefault(idB, Collections.emptySet());

                // Check Shared Tags
                boolean tagMatch = false;
                for (String tag : tagsA) {
                    if (tagsB.contains(tag)) {
                        links.add(new GraphResponse.Link(idA, idB, "shared_tag"));
                        tagMatch = true;
                        break;
                    }
                }

                if (tagMatch) continue; // avoid duplicate links

                // Check Shared Keywords
                for (String word : keywordsA) {
                    if (keywordsB.contains(word)) {
                        links.add(new GraphResponse.Link(idA, idB, "keyword_match"));
                        break;
                    }
                }
            }
        }

        return ResponseEntity.ok(new GraphResponse(nodes, links));
    }

    // Helper to extract words longer than 3 characters from titles
    private Set<String> extractKeywords(String title) {
        if (title == null) return Collections.emptySet();
        Set<String> keywords = new HashSet<>();
        String[] words = title.toLowerCase().split("[^a-zA-Z0-9]+");
        for (String w : words) {
            if (w.length() > 3) {
                keywords.add(w);
            }
        }
        return keywords;
    }

    // Helper to parse tag strings
    private Set<String> parseTags(String tagsString) {
        if (tagsString == null || tagsString.trim().isEmpty()) return Collections.emptySet();
        Set<String> tags = new HashSet<>();
        String[] split = tagsString.toLowerCase().split(",");
        for (String s : split) {
            String tag = s.trim();
            if (!tag.isEmpty()) {
                tags.add(tag);
            }
        }
        return tags;
    }
}

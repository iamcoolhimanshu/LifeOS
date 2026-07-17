package com.lifeos.api.controller;

import com.lifeos.api.dto.EventDTO;
import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.model.Event;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.EventService;
import com.lifeos.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
    @Autowired
    private EventService eventService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<Event>> getEvents(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(eventService.getEventsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(eventService.getEventForUser(user, id));
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@AuthenticationPrincipal UserDetailsImpl userDetails, @Valid @RequestBody EventDTO eventDTO) {
        User user = getAuthenticatedUser(userDetails);
        Event event = eventService.createEvent(
                user,
                eventDTO.getTitle(),
                eventDTO.getDescription(),
                eventDTO.getStartTime(),
                eventDTO.getEndTime(),
                eventDTO.isAllDay(),
                eventDTO.getColor(),
                eventDTO.getCategory()
        );
        activityLogService.logActivity(user, "EVENT_CREATE", "Scheduled event: " + event.getTitle());
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id, @Valid @RequestBody EventDTO eventDTO) {
        User user = getAuthenticatedUser(userDetails);
        Event event = eventService.updateEvent(
                user,
                id,
                eventDTO.getTitle(),
                eventDTO.getDescription(),
                eventDTO.getStartTime(),
                eventDTO.getEndTime(),
                eventDTO.isAllDay(),
                eventDTO.getColor(),
                eventDTO.getCategory()
        );
        activityLogService.logActivity(user, "EVENT_UPDATE", "Updated event: " + event.getTitle());
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Event event = eventService.getEventForUser(user, id);
        eventService.deleteEvent(user, id);
        activityLogService.logActivity(user, "EVENT_DELETE", "Cancelled event: " + event.getTitle());
        return ResponseEntity.ok(new MessageResponse("Event deleted successfully."));
    }
}

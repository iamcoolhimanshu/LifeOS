package com.lifeos.api.service;

import com.lifeos.api.model.Event;
import com.lifeos.api.model.User;
import com.lifeos.api.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    public List<Event> getEventsForUser(User user) {
        return eventRepository.findByUserOrderByStartTimeAsc(user);
    }

    public List<Event> getEventsBetween(User user, LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user, start, end);
    }

    public Event getEventForUser(User user, Long id) {
        return eventRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Event not found or access denied"));
    }

    public Event createEvent(User user, String title, String description, LocalDateTime startTime, LocalDateTime endTime, boolean allDay, String color, String category) {
        Event event = new Event(user, title, description, startTime, endTime, allDay, color, category);
        return eventRepository.save(event);
    }

    public Event updateEvent(User user, Long id, String title, String description, LocalDateTime startTime, LocalDateTime endTime, boolean allDay, String color, String category) {
        Event event = getEventForUser(user, id);
        event.setTitle(title);
        event.setDescription(description);
        event.setStartTime(startTime);
        event.setEndTime(endTime);
        event.setAllDay(allDay);
        event.setColor(color);
        event.setCategory(category);
        return eventRepository.save(event);
    }

    public void deleteEvent(User user, Long id) {
        Event event = getEventForUser(user, id);
        eventRepository.delete(event);
    }
}

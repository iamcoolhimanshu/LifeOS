import React, { useEffect, useState } from 'react';
import { useEventStore } from '../stores/useEventStore';
import { GlassCard } from '../components/GlassCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Trash2, Clock, MapPin } from 'lucide-react';
import { Event } from '../types';

export const Calendar: React.FC = () => {
  const { events, isLoading, fetchEvents, createEvent, updateEvent, deleteEvent } = useEventStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState('#a855f7'); // default purple
  const [category, setCategory] = useState('Personal');

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Date navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Fill previous month padding days
    const paddingDays = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      paddingDays.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    // Current month days
    const currentDays = [];
    for (let i = 1; i <= totalDays; i++) {
      currentDays.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    return [...paddingDays, ...currentDays];
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Helper to match events with a calendar day
  const getEventsForDay = (dayDate: Date) => {
    return events.filter(e => {
      const eventStart = new Date(e.startTime);
      return eventStart.getDate() === dayDate.getDate() &&
             eventStart.getMonth() === dayDate.getMonth() &&
             eventStart.getFullYear() === dayDate.getFullYear();
    });
  };

  // Open modal for new event or editing
  const openNewEventModal = (dayDate?: Date) => {
    setSelectedEvent(null);
    setTitle('');
    setDescription('');
    
    // Set default time (today or clicked day)
    const baseDate = dayDate || new Date();
    const startIso = new Date(baseDate.setHours(9, 0, 0, 0)).toISOString().slice(0, 16);
    const endIso = new Date(baseDate.setHours(10, 0, 0, 0)).toISOString().slice(0, 16);
    setStartTime(startIso);
    setEndTime(endIso);
    
    setAllDay(false);
    setColor('#a855f7');
    setCategory('Personal');
    setIsModalOpen(true);
  };

  const openEditEventModal = (event: Event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setStartTime(new Date(event.startTime).toISOString().slice(0, 16));
    setEndTime(new Date(event.endTime).toISOString().slice(0, 16));
    setAllDay(event.allDay);
    setColor(event.color || '#a855f7');
    setCategory(event.category || 'Personal');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      allDay,
      color,
      category
    };

    if (selectedEvent) {
      await updateEvent(selectedEvent.id, data);
    } else {
      await createEvent(data);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(id);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <CalendarIcon className="text-purple-500 dark:text-purple-400" size={24} /> Interactive Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage events, study blocks, and critical project deadlines.</p>
        </div>
        <button
          onClick={() => openNewEventModal()}
          className="btn-cyber py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Add Event
        </button>
      </div>

      {/* Main Grid Calendar Container */}
      <GlassCard className="p-6">
        {/* Month Selector Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-md font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {monthName} <span className="text-slate-400 dark:text-slate-500 font-normal">{year}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition uppercase tracking-wider"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week Column Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((dayItem, index) => {
            const dayEvents = getEventsForDay(dayItem.date);
            const isToday = new Date().toDateString() === dayItem.date.toDateString();

            return (
              <div
                key={index}
                onClick={() => openNewEventModal(dayItem.date)}
                className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer group ${
                  dayItem.isCurrentMonth
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
                    : 'border-slate-100 dark:border-slate-900 bg-transparent text-slate-400 dark:text-slate-600 opacity-40'
                } ${isToday ? 'ring-1 ring-purple-500' : ''}`}
              >
                {/* Day Number */}
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isToday ? 'bg-purple-500 text-white' : 'text-slate-700 dark:text-slate-400'
                  }`}>
                    {dayItem.day}
                  </span>
                </div>

                {/* Day Events stack list */}
                <div className="flex-1 overflow-y-auto space-y-1 scroll-custom pr-1 max-h-[60px]" onClick={e => e.stopPropagation()}>
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => openEditEventModal(event)}
                      style={{ borderLeftColor: event.color }}
                      className="text-[9px] font-semibold text-slate-800 dark:text-slate-100 p-1.5 rounded bg-slate-100/80 dark:bg-slate-800/90 border-l-2 hover:bg-slate-200 dark:hover:bg-slate-700 truncate transition"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Action Dialog / Event Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <GlassCard className="w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <CalendarIcon size={16} className="text-purple-500" />
              {selectedEvent ? 'Edit Event details' : 'Schedule New Event'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brainstorming session"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Notes, link addresses, agenda guides..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Start Date/Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">End Date/Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input-cyber text-xs py-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Studies">Studies</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Label Color</label>
                  <div className="flex gap-2.5 items-center mt-2.5">
                    {['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border-2 transition ${
                          color === c ? 'border-white ring-2 ring-purple-500 scale-110' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-cyber py-2 px-5 rounded-xl text-xs font-bold text-white"
                  >
                    {selectedEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../stores/useTaskStore';
import { GlassCard } from '../components/GlassCard';
import { CheckSquare, Plus, Clock, Trash2, Edit3, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Task } from '../types';

export const Tasks: React.FC = () => {
  const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('MEDIUM');
    setCategory('General');
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
    setPriority(task.priority);
    setCategory(task.category || 'General');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      category,
      status: selectedTask ? selectedTask.status : 'TODO'
    };

    if (selectedTask) {
      await updateTask(selectedTask.id, data);
    } else {
      await createTask(data);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
      setIsModalOpen(false);
    }
  };

  const moveTaskStatus = async (task: Task, direction: 'forward' | 'backward') => {
    let nextStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' = 'TODO';
    if (task.status === 'TODO') {
      nextStatus = direction === 'forward' ? 'IN_PROGRESS' : 'TODO';
    } else if (task.status === 'IN_PROGRESS') {
      nextStatus = direction === 'forward' ? 'COMPLETED' : 'TODO';
    } else if (task.status === 'COMPLETED') {
      nextStatus = direction === 'backward' ? 'IN_PROGRESS' : 'COMPLETED';
    }
    await updateTask(task.id, { status: nextStatus });
  };

  // Groups
  const columns = [
    { key: 'TODO', title: 'To Do', border: 'border-t-purple-500' },
    { key: 'IN_PROGRESS', title: 'In Progress', border: 'border-t-cyan-500' },
    { key: 'COMPLETED', title: 'Completed', border: 'border-t-emerald-500' }
  ];

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'HIGH': return 'text-red-500 bg-red-500/10 dark:bg-red-500/5';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5';
      default: return 'text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/5';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <CheckSquare className="text-purple-500 dark:text-purple-400" size={24} /> Tasks Kanban Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track and push your actions through production pipelines.</p>
        </div>
        <button
          onClick={openNewTaskModal}
          className="btn-cyber py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Columns Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);

          return (
            <GlassCard key={col.key} className={`p-5 flex flex-col min-h-[500px] border-t-2 ${col.border}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{col.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[520px] pr-1 scroll-custom">
                {colTasks.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-12">No tasks in this category.</p>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 hover:border-purple-500/20 transition group flex flex-col justify-between gap-3 relative"
                    >
                      <div>
                        {/* Header details */}
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-semibold uppercase">{task.category || 'General'}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 group-hover:text-purple-500 transition line-clamp-1">{task.title}</h4>
                        {task.description && (
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>

                      {/* Footer actions */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-850/50 text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: '2-digit' }) : 'No limit'}
                        </span>
                        
                        {/* Column flow push buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditTaskModal(task)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                            title="Edit"
                          >
                            <Edit3 size={12} />
                          </button>
                          {col.key !== 'TODO' && (
                            <button
                              onClick={() => moveTaskStatus(task, 'backward')}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                              title="Move back"
                            >
                              <ArrowLeft size={12} />
                            </button>
                          )}
                          {col.key !== 'COMPLETED' && (
                            <button
                              onClick={() => moveTaskStatus(task, 'forward')}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                              title="Move forward"
                            >
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <GlassCard className="w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-white transition"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <CheckSquare size={16} className="text-purple-500" />
              {selectedTask ? 'Edit Task Info' : 'Add New Task'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wrap up frontend UI polishing"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Describe key acceptance parameters..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="input-cyber text-xs py-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Work, Workouts, Code"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-850">
                {selectedTask ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold"
                  >
                    <Trash2 size={14} /> Remove Task
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
                    {selectedTask ? 'Save Changes' : 'Create Task'}
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

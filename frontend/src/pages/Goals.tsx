import React, { useEffect, useState } from 'react';
import { useGoalStore } from '../stores/useGoalStore';
import { GlassCard } from '../components/GlassCard';
import { Target, Plus, Calendar, CheckCircle, Trash2, Edit3, X } from 'lucide-react';
import { Goal } from '../types';

export const Goals: React.FC = () => {
  const { goals, isLoading, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'IN_PROGRESS' | 'ACHIEVED' | 'ABANDONED'>('IN_PROGRESS');
  const [category, setCategory] = useState('Career');

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const openNewGoalModal = () => {
    setSelectedGoal(null);
    setTitle('');
    setDescription('');
    setTargetDate('');
    setProgress(0);
    setStatus('IN_PROGRESS');
    setCategory('Career');
    setIsModalOpen(true);
  };

  const openEditGoalModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTargetDate(goal.targetDate || '');
    setProgress(goal.progress);
    setStatus(goal.status);
    setCategory(goal.category || 'Career');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description,
      targetDate: targetDate || undefined,
      progress,
      status,
      category
    };

    if (selectedGoal) {
      await updateGoal(selectedGoal.id, data);
    } else {
      await createGoal(data);
    }
    setIsModalOpen(false);
  };

  const handleDeleteGoal = async (id: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
      setIsModalOpen(false);
    }
  };

  // Stats calculation
  const totalActive = goals.filter(g => g.status === 'IN_PROGRESS').length;
  const totalAchieved = goals.filter(g => g.status === 'ACHIEVED').length;
  const successRate = goals.length > 0 ? Math.round((totalAchieved / goals.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <Target className="text-purple-500 dark:text-purple-400" size={24} /> Goals & Milestones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Design your roadmap, set target dates, and watch your metrics level up.</p>
        </div>
        <button
          onClick={openNewGoalModal}
          className="btn-cyber py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Set Goal
        </button>
      </div>

      {/* KPI Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Roadmap</span>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">{totalActive}</h3>
          </div>
          <Target className="text-purple-500" size={24} />
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Achieved Goals</span>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalAchieved}</h3>
          </div>
          <CheckCircle className="text-emerald-500" size={24} />
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completion rate</span>
            <h3 className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{successRate}%</h3>
          </div>
          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div style={{ width: `${successRate}%` }} className="h-full bg-cyan-400" />
          </div>
        </GlassCard>
      </div>

      {/* Goals List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <GlassCard className="p-12 text-center md:col-span-2">
            <p className="text-xs text-slate-500">No goals logged yet. Define a target milestone to keep yourself aligned!</p>
          </GlassCard>
        ) : (
          goals.map(goal => {
            const statusColor = goal.status === 'ACHIEVED' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : goal.status === 'ABANDONED' 
                ? 'bg-red-500/10 text-red-400' 
                : 'bg-purple-500/10 text-purple-450 dark:text-purple-400';

            return (
              <GlassCard key={goal.id} className="p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold uppercase">{goal.category || 'Roadmap'}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${statusColor}`}>{goal.status.replace(/_/g, ' ')}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-3">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">{goal.description}</p>
                  )}
                </div>

                {/* Progress bar visual slider indicator */}
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar size={10} />
                      Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No date limit'}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div style={{ width: `${goal.progress}%` }} className="h-full bg-purple-500 transition-all duration-300" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850/40">
                  <button
                    onClick={() => openEditGoalModal(goal)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-550 dark:text-slate-450 transition text-[10px] flex items-center gap-1 font-bold"
                  >
                    <Edit3 size={11} /> Modify
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Modal Sheet */}
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
              <Target size={16} className="text-purple-500" />
              {selectedGoal ? 'Edit Goal details' : 'Set New Milestone'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Milestone Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete AWS Developer Associate certification"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Action Plan / Description</label>
                <textarea
                  placeholder="Summarize your execution steps..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Learning, Finance, Health"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Current Progress ({progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={e => setProgress(Number(e.target.value))}
                    className="w-full mt-3 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="input-cyber text-xs py-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="ACHIEVED">ACHIEVED</option>
                    <option value="ABANDONED">ABANDONED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-850">
                {selectedGoal ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(selectedGoal.id)}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold"
                  >
                    <Trash2 size={14} /> Delete Goal
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
                    {selectedGoal ? 'Save Changes' : 'Set Goal'}
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

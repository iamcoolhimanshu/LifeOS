import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Smartphone, Home, FileText, CheckSquare, Settings, Mic, Wifi, Battery, BatteryCharging, Shield, Sparkles } from 'lucide-react';

export const MobileSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'notes' | 'tasks' | 'settings'>('home');
  const [mobileNotes, setMobileNotes] = useState([
    { id: 1, title: 'Gym Workout Plan', category: 'Health' },
    { id: 2, title: 'Ideas for web app dev', category: 'Work' },
    { id: 3, title: 'Groceries Checklist', category: 'Personal' }
  ]);
  const [mobileTasks, setMobileTasks] = useState([
    { id: 1, title: 'Setup Maven profile configurations', done: true },
    { id: 2, title: 'Deploy Chrome extension unpacked folder', done: false },
    { id: 3, title: 'Test speech recognitions input', done: false }
  ]);
  const [voiceRecording, setVoiceRecording] = useState(false);

  const toggleTask = (id: number) => {
    setMobileTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddQuickNote = () => {
    const title = prompt('Enter note title:');
    if (title) {
      setMobileNotes(prev => [
        { id: Date.now(), title, category: 'Mobile' },
        ...prev
      ]);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
          <Smartphone className="text-cyberBlue" size={24} /> Mobile App Simulator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Interactive simulator showing how the LifeOS platform adapts to mobile viewports and devices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Simulator controls */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4">
              LifeOS Mobile Features
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-start gap-2.5">
                <Shield size={14} className="text-cyberBlue mt-0.5" />
                <span><strong>Responsive Shell:</strong> Sidebars contract into drawer sheets; layouts flow into unified columns.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mic size={14} className="text-purple-400 mt-0.5" />
                <span><strong>Voice Transcription:</strong> Integrated mobile mic for dictating notes on-the-go.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Sparkles size={14} className="text-amber-400 mt-0.5" />
                <span><strong>Fast Captures:</strong> Quick-add notes and tick tasks immediately from the home launcher widget.</span>
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3">
              Simulation Actions
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Use the bottom navigation tabs in the phone simulator to switch pages. Click the floating microphone button or checklist items to interact!
            </p>
            <button
              onClick={handleAddQuickNote}
              className="w-full btn-cyber py-2 px-4 text-xs font-bold text-white flex items-center justify-center gap-1.5"
            >
              Simulate Note Creation
            </button>
          </GlassCard>
        </div>

        {/* The Mobile Phone Frame Container */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-[340px] h-[640px] rounded-[48px] bg-slate-950 border-[10px] border-slate-900 shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative">
            
            {/* Phone Notch / Camera island */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-950 block border border-slate-800" />
            </div>

            {/* Mobile Status Bar */}
            <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wide select-none bg-slate-950/60 shrink-0 z-30">
              <span>03:45 PM</span>
              <div className="flex items-center gap-1.5">
                <Wifi size={10} />
                <Battery size={12} className="text-green-400" />
              </div>
            </div>

            {/* Active Phone Screen content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scroll-custom bg-[#090d16] text-white">
              {activeTab === 'home' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">LifeOS Mobile</h4>
                      <span className="text-[9px] text-cyberBlue uppercase tracking-wider font-semibold block">Connected Brain</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-[9px] text-purple-400 font-bold border border-purple-500/20">Sync OK</span>
                  </div>

                  {/* Summary Widget */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-3">
                    <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Brain Index</span>
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black">{mobileNotes.length + mobileTasks.length} Items</span>
                      <span className="text-[10px] text-green-400 font-bold">85% Productivity</span>
                    </div>
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Shortcuts</span>
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                      <div
                        onClick={handleAddQuickNote}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-850 hover:border-purple-500/35 cursor-pointer transition"
                      >
                        + Add Note
                      </div>
                      <div
                        onClick={() => setActiveTab('tasks')}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-850 hover:border-cyan-500/35 cursor-pointer transition"
                      >
                        Check Tasks
                      </div>
                    </div>
                  </div>

                  {/* Quick Activity timeline logs */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Logs</span>
                    <div className="space-y-1.5">
                      <div className="p-2.5 rounded-xl bg-slate-900/30 border border-slate-900/40 text-[10px]">
                        <span className="font-semibold block text-slate-200">Mobile Sync</span>
                        <span className="text-slate-500 text-[9px] block">Updated knowledge network 5m ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center mt-2">
                    <h4 className="text-sm font-extrabold">Smart Notes</h4>
                    <button
                      onClick={handleAddQuickNote}
                      className="px-2 py-1 bg-cyberBlue hover:bg-cyberBlue/80 text-white rounded-lg text-[9px] font-bold"
                    >
                      + New
                    </button>
                  </div>

                  <div className="space-y-2">
                    {mobileNotes.map((note) => (
                      <div key={note.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs block text-slate-200">{note.title}</span>
                          <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block mt-1">{note.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-extrabold mt-2">Tasks List</h4>
                  
                  <div className="space-y-2.5">
                    {mobileTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          task.done 
                            ? 'bg-slate-950/20 border-slate-900 text-slate-500 line-through'
                            : 'bg-slate-900/60 border-slate-850 text-slate-200 hover:border-cyberBlue/45'
                        }`}
                      >
                        <span className="text-xs font-medium">{task.title}</span>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-cyberBlue focus:ring-0 pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-extrabold mt-2">Settings</h4>

                  <div className="space-y-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex justify-between items-center">
                      <span>Biometric FaceID</span>
                      <span className="text-[10px] text-green-400 font-bold">Enabled</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex justify-between items-center">
                      <span>Offline Storage</span>
                      <span className="text-[10px] text-slate-500">24.5 MB used</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mic Overlay popover */}
            {voiceRecording && (
              <div className="absolute inset-x-0 bottom-16 bg-slate-950/95 border-t border-purple-500/20 p-5 z-40 text-center flex flex-col items-center justify-center gap-3 animate-slideUp">
                <div className="h-10 w-10 rounded-full bg-red-500/20 border border-red-500 text-red-500 flex items-center justify-center animate-pulse">
                  <Mic size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold block">Listening...</span>
                  <span className="text-[9px] text-slate-500 mt-1 block">Speak to record quick notes directly</span>
                </div>
                <button
                  onClick={() => setVoiceRecording(false)}
                  className="px-3 py-1 rounded bg-slate-900 text-slate-400 hover:text-white text-[9px] font-semibold border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Phone Bottom Navigation Panel */}
            <div className="h-16 border-t border-slate-900 bg-slate-950/80 flex items-center justify-around px-2 relative shrink-0 z-30">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold ${activeTab === 'home' ? 'text-cyberBlue' : 'text-slate-500'}`}
              >
                <Home size={16} />
                <span>Home</span>
              </button>
              <button 
                onClick={() => setActiveTab('notes')}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold ${activeTab === 'notes' ? 'text-cyberBlue' : 'text-slate-500'}`}
              >
                <FileText size={16} />
                <span>Notes</span>
              </button>
              
              {/* Floating Center Mic Action */}
              <button 
                onClick={() => setVoiceRecording(true)}
                className="h-11 w-11 rounded-full bg-gradient-to-tr from-neonPurple to-cyberBlue text-white shadow-lg flex items-center justify-center transform -translate-y-4 border-2 border-slate-950 active:scale-95 transition"
              >
                <Mic size={18} />
              </button>

              <button 
                onClick={() => setActiveTab('tasks')}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold ${activeTab === 'tasks' ? 'text-cyberBlue' : 'text-slate-500'}`}
              >
                <CheckSquare size={16} />
                <span>Tasks</span>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold ${activeTab === 'settings' ? 'text-cyberBlue' : 'text-slate-500'}`}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

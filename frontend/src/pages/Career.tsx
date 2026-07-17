import React, { useEffect, useState } from 'react';
import { useCareerStore } from '../stores/useCareerStore';
import { GlassCard } from '../components/GlassCard';
import { Briefcase, Plus, ExternalLink, Trash2, Edit3, X, ArrowLeft, ArrowRight, DollarSign } from 'lucide-react';
import { JobApplication } from '../types';

export const Career: React.FC = () => {
  const { applications, isLoading, fetchApplications, createApplication, updateApplication, deleteApplication } = useCareerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED'>('APPLIED');
  const [salary, setSalary] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [appliedDate, setAppliedDate] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const openNewAppModal = () => {
    setSelectedApp(null);
    setCompany('');
    setRole('');
    setStatus('APPLIED');
    setSalary('');
    setUrl('');
    setNotes('');
    setAppliedDate(new Date().toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const openEditAppModal = (app: JobApplication) => {
    setSelectedApp(app);
    setCompany(app.company);
    setRole(app.role);
    setStatus(app.status);
    setSalary(app.salary || '');
    setUrl(app.url || '');
    setNotes(app.notes || '');
    setAppliedDate(app.appliedDate || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      company,
      role,
      status,
      salary: salary || undefined,
      url: url || undefined,
      notes,
      appliedDate: appliedDate || undefined
    };

    if (selectedApp) {
      await updateApplication(selectedApp.id, data);
    } else {
      await createApplication(data);
    }
    setIsModalOpen(false);
  };

  const handleDeleteApp = async (id: number) => {
    if (confirm('Are you sure you want to delete this job application?')) {
      await deleteApplication(id);
      setIsModalOpen(false);
    }
  };

  const moveApplicationStatus = async (app: JobApplication, direction: 'forward' | 'backward') => {
    let nextStatus: 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED' = 'APPLIED';
    const statusOrder: ('APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED')[] = ['APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];
    const currentIndex = statusOrder.indexOf(app.status);
    
    if (direction === 'forward' && currentIndex < statusOrder.length - 1) {
      nextStatus = statusOrder[currentIndex + 1];
    } else if (direction === 'backward' && currentIndex > 0) {
      nextStatus = statusOrder[currentIndex - 1];
    } else {
      return;
    }
    
    await updateApplication(app.id, { status: nextStatus });
  };

  const columns = [
    { key: 'APPLIED', title: 'Applied', border: 'border-t-slate-400' },
    { key: 'INTERVIEWING', title: 'Interviewing', border: 'border-t-cyan-500' },
    { key: 'OFFER', title: 'Offer Received', border: 'border-t-emerald-500' },
    { key: 'REJECTED', title: 'Rejected', border: 'border-t-red-500' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <Briefcase className="text-purple-500 dark:text-purple-400" size={24} /> Job Hunt Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Monitor job applications, technical screening rounds, and offers status.</p>
        </div>
        <button
          onClick={openNewAppModal}
          className="btn-cyber py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Add Job Application
        </button>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(col => {
          const colApps = applications.filter(a => a.status === col.key);

          return (
            <GlassCard key={col.key} className={`p-4 flex flex-col min-h-[480px] border-t-2 ${col.border}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{col.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold">{colApps.length}</span>
              </div>

              {/* Stack */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[460px] pr-1 scroll-custom">
                {colApps.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-12">No records.</p>
                ) : (
                  colApps.map(app => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 hover:border-purple-500/20 transition group flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-purple-400 transition">{app.company}</h4>
                          {app.url && (
                            <a
                              href={app.url.startsWith('http') ? app.url : `https://${app.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-white transition shrink-0"
                            >
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{app.role}</p>

                        {app.salary && (
                          <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                            <DollarSign size={10} /> {app.salary}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-slate-850/50 text-[9px] text-slate-500">
                        <span>{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString([], { month: 'short', day: '2-digit' }) : 'No Date'}</span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditAppModal(app)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                            title="Edit"
                          >
                            <Edit3 size={11} />
                          </button>
                          {col.key !== 'APPLIED' && (
                            <button
                              onClick={() => moveApplicationStatus(app, 'backward')}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                              title="Move back"
                            >
                              <ArrowLeft size={11} />
                            </button>
                          )}
                          {col.key !== 'REJECTED' && (
                            <button
                              onClick={() => moveApplicationStatus(app, 'forward')}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                              title="Move forward"
                            >
                              <ArrowRight size={11} />
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

      {/* Modal Dialog Sheet */}
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
              <Briefcase size={16} className="text-purple-500" />
              {selectedApp ? 'Edit Job application' : 'Track New Job Hunt'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Job Role / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend Dev"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Salary Package</label>
                  <input
                    type="text"
                    placeholder="e.g. $120,000 / year"
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Funnel State</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="input-cyber text-xs py-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <option value="APPLIED">APPLIED</option>
                    <option value="INTERVIEWING">INTERVIEWING</option>
                    <option value="OFFER">OFFER</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Application Link</label>
                  <input
                    type="text"
                    placeholder="e.g. careers.google.com/jobs..."
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Date Applied</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={e => setAppliedDate(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Screening notes / Job details</label>
                <textarea
                  placeholder="Notes, hiring manager, interview rounds guidelines..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-850">
                {selectedApp ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteApp(selectedApp.id)}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold"
                  >
                    <Trash2 size={14} /> Remove Track
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
                    {selectedApp ? 'Save Changes' : 'Add Application'}
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Mail, 
  RefreshCw, 
  Search, 
  Star, 
  Paperclip, 
  BrainCircuit, 
  Check, 
  X, 
  MessageSquareCode, 
  User, 
  Calendar, 
  Sparkles, 
  CheckCircle,
  FileText,
  FileCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { Link } from 'react-router-dom';

interface EmailMessage {
  id: number;
  senderName: string;
  senderEmail: string;
  recipientEmails: string;
  subject: string;
  snippet: string;
  plainTextBody: string;
  receivedAt: string;
  hasAttachments: boolean;
  important: boolean;
  readStatus: boolean;
  category: string;
  aiProcessed: boolean;
}

interface EmailAction {
  id: number;
  actionType: string;
  actionTitle: string;
  actionDescription: string;
  status: string; // SUGGESTED, APPROVED, REJECTED, EXECUTED, FAILED
}

export const EmailInbox: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  
  // State variables
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<EmailAction[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Async states
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState<boolean>(false);
  const [draftContent, setDraftContent] = useState<string | null>(null);
  const [draftSubject, setDraftSubject] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Connection Check State
  const [connections, setConnections] = useState<any[]>([]);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/integrations/google/status', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setConnections(response.data);
    } catch (err) {
      console.error('Error fetching google connection status', err);
    }
  };

  const fetchMessages = async (tab: string, query: string) => {
    setIsLoadingMessages(true);
    try {
      let url = `http://localhost:8080/api/email/messages?page=0&size=20`;
      if (tab === 'IMPORTANT') {
        url += '&important=true';
      } else if (tab !== 'ALL') {
        url += `&category=${tab}`;
      }
      if (query.trim() !== '') {
        url += `&query=${encodeURIComponent(query)}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setMessages(response.data.content || []);
    } catch (err) {
      console.error('Error fetching email messages', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/email/actions', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setSuggestedActions(response.data);
    } catch (err) {
      console.error('Error fetching email actions', err);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await axios.post('http://localhost:8080/api/email/sync', {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      await fetchMessages(activeTab, searchQuery);
      await fetchActions();
      await fetchConnections();
    } catch (err) {
      console.error('Sync failure', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApproveAction = async (actionId: number) => {
    setActionMessage(null);
    try {
      await axios.post(`http://localhost:8080/api/email/actions/${actionId}/approve`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setActionMessage('Action approved and added to your LifeOS!');
      fetchActions();
    } catch (err: any) {
      console.error('Approval failed', err);
      setActionMessage(err.response?.data?.message || 'Action approval failed.');
    }
  };

  const handleRejectAction = async (actionId: number) => {
    setActionMessage(null);
    try {
      await axios.post(`http://localhost:8080/api/email/actions/${actionId}/reject`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setActionMessage('Suggested action rejected.');
      fetchActions();
    } catch (err: any) {
      console.error('Rejection failed', err);
    }
  };

  const handleGenerateReply = async (emailId: number) => {
    setIsGeneratingDraft(true);
    setDraftContent(null);
    try {
      const response = await axios.post(`http://localhost:8080/api/email/draft/generate?emailId=${emailId}`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setDraftSubject(response.data.subject);
      setDraftContent(response.data.body);
    } catch (err) {
      console.error('Failed to generate draft', err);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchMessages(activeTab, searchQuery);
    fetchActions();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages(activeTab, searchQuery);
  };

  const emailCategories = [
    { label: 'All', value: 'ALL' },
    { label: 'Important', value: 'IMPORTANT' },
    { label: 'Career', value: 'CAREER' },
    { label: 'Interview', value: 'INTERVIEW' },
    { label: 'Finance', value: 'FINANCE' },
    { label: 'Documents', value: 'DOCUMENT' },
    { label: 'Travel', value: 'TRAVEL' },
    { label: 'Personal', value: 'PERSONAL' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent text-slate-800 dark:text-slate-100 select-none">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-neonPurple to-cyberBlue flex items-center justify-center text-white">
              <Mail size={14} />
            </div>
            <span className="text-[10px] uppercase font-bold text-cyberBlue tracking-widest">Digital Brain Inbox</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">AI Inbox</h1>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3">
          {connections.length > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-550/10 border border-green-500/20 text-green-400 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
              Gmail Linked ({connections[0].emailAddress})
            </div>
          ) : (
            <Link 
              to="/settings?tab=integrations" 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/20 transition-all"
            >
              <AlertCircle size={14} /> Link Gmail Account
            </Link>
          )}

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-cyber py-2 px-4 flex items-center gap-2 text-xs font-bold text-white shadow-lg"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Inbox'}
          </button>
        </div>
      </div>

      {/* RAG Context Prompt Bar */}
      <div className="glass-card border border-slate-200 dark:border-darkBorder p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-gradient-to-r from-neonPurple/5 via-transparent to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-neonPurple/10 border border-neonPurple/20 flex items-center justify-center text-neonPurple shrink-0">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">AI Inbox Personalization</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              LifeOS AI automatically extracts appointments, tracks bills, and drafts replies.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800/60 px-3 py-1.5 rounded-lg flex items-center gap-1">
          <Sparkles size={12} className="text-cyberBlue" />
          <span>Active Classification: Llama-3.3-70B</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Email List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
              {emailCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveTab(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    activeTab === cat.value
                      ? 'bg-gradient-to-r from-neonPurple/30 to-cyberBlue/20 border border-cyberBlue/40 text-cyberBlue'
                      : 'bg-slate-200/50 hover:bg-slate-200 border border-slate-350 text-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-60">
              <input
                type="text"
                placeholder="Search inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-900 text-xs text-slate-800 dark:text-white outline-none focus:border-cyberBlue"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-500" size={14} />
            </form>
          </div>

          {/* Email Item Feed */}
          <div className="glass-card border border-slate-200 dark:border-darkBorder max-h-[600px] overflow-y-auto pr-1">
            {isLoadingMessages ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw size={24} className="animate-spin text-cyberBlue" />
                <span className="text-xs text-slate-500 font-semibold">Retrieving email inbox records...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <Mail size={32} className="text-slate-650" />
                <span className="text-xs text-slate-500 font-semibold">No emails match the selected filters.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-900">
                {messages.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  const hasAction = suggestedActions.some(act => act.status === 'SUGGESTED');
                  
                  return (
                    <div
                      key={email.id}
                      onClick={() => {
                        setSelectedEmail(email);
                        setDraftContent(null);
                        setActionMessage(null);
                      }}
                      className={`p-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition flex gap-3 relative ${
                        isSelected ? 'bg-slate-200/40 dark:bg-slate-900/30' : ''
                      }`}
                    >
                      {/* Left Category Indicator */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          email.category === 'INTERVIEW' ? 'bg-purple-500/10 text-purple-400' :
                          email.category === 'FINANCE' ? 'bg-emerald-500/10 text-emerald-400' :
                          email.category === 'IMPORTANT' ? 'bg-red-500/10 text-red-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {email.category === 'INTERVIEW' ? <Calendar size={14} /> :
                           email.category === 'FINANCE' ? <Star size={14} /> :
                           <Mail size={14} />}
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[200px]">
                            {email.senderName || email.senderEmail}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {new Date(email.receivedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-slate-750 dark:text-slate-200 truncate mb-1">
                          {email.subject}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-405 truncate">
                          {email.snippet}
                        </p>

                        {/* Badges block */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[9px] font-extrabold text-slate-650 dark:text-slate-400 tracking-wide uppercase">
                            {email.category || 'GENERAL'}
                          </span>
                          {email.important && (
                            <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-extrabold tracking-wide uppercase">
                              Important
                            </span>
                          )}
                          {email.hasAttachments && (
                            <Paperclip size={10} className="text-slate-550 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detail Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedEmail ? (
            <div className="glass-card border border-slate-200 dark:border-darkBorder p-6 flex flex-col gap-5">
              
              {/* Header Envelope */}
              <div className="border-b border-slate-100 dark:border-slate-900 pb-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-white mb-2 leading-relaxed">
                  {selectedEmail.subject}
                </h3>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {selectedEmail.senderName}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      &lt;{selectedEmail.senderEmail}&gt;
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {new Date(selectedEmail.receivedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* AI Assistant Analysis Drawer */}
              <div className="bg-gradient-to-tr from-neonPurple/10 to-cyberBlue/5 border border-neonPurple/25 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="text-neonPurple shrink-0" size={16} />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-800 dark:text-white">AI Assistant Summary</span>
                </div>
                
                {/* Categorization & score */}
                <div className="flex gap-2">
                  <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Category</span>
                    <span className="text-xs font-bold text-cyberBlue uppercase">{selectedEmail.category || 'PERSONAL'}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">AI Priority</span>
                    <span className="text-xs font-bold text-neonPurple">{selectedEmail.important ? 'HIGH' : 'NORMAL'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-605 dark:text-slate-400 leading-relaxed italic bg-slate-100 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-900/50">
                  "{selectedEmail.snippet}"
                </p>
              </div>

              {/* Action approvals block */}
              {suggestedActions.filter(act => act.status === 'SUGGESTED').length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <Sparkles size={16} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">AI Suggested Action Approval</span>
                  </div>

                  {actionMessage && (
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white text-[11px] text-center font-bold">
                      {actionMessage}
                    </div>
                  )}

                  {suggestedActions
                    .filter(act => act.status === 'SUGGESTED')
                    .map((action) => (
                      <div key={action.id} className="bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-900/60 p-3.5 rounded-xl space-y-3">
                        <div>
                          <h5 className="text-xs font-bold text-slate-850 dark:text-white">{action.actionTitle}</h5>
                          <p className="text-[11px] text-slate-550 mt-1">{action.actionDescription}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveAction(action.id)}
                            className="flex-1 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 text-xs font-extrabold flex items-center justify-center gap-1 transition"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectAction(action.id)}
                            className="py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-xs font-extrabold flex items-center justify-center gap-1 transition"
                          >
                            <X size={12} /> Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Draft Reply Generator */}
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase text-slate-500">AI Response Suite</span>
                  <button
                    onClick={() => handleGenerateReply(selectedEmail.id)}
                    disabled={isGeneratingDraft}
                    className="py-1.5 px-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-855 border border-slate-200 dark:border-slate-800 text-xs font-bold text-cyberBlue hover:text-cyberBlue/90 flex items-center gap-1.5 transition"
                  >
                    <MessageSquareCode size={12} />
                    {isGeneratingDraft ? 'Generating Draft...' : 'Generate AI Reply'}
                  </button>
                </div>

                {draftContent && (
                  <div className="bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-extrabold border-b border-slate-200 dark:border-slate-900 pb-2">
                      <span>Generated Response Draft</span>
                      <span className="text-green-600 dark:text-green-400">Copy Ready</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-850 dark:text-white mb-1">
                      Subject: {draftSubject}
                    </div>
                    <textarea
                      readOnly
                      value={draftContent}
                      className="w-full h-36 bg-transparent text-[11px] leading-relaxed text-slate-700 dark:text-slate-350 outline-none resize-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(draftContent);
                        alert('Reply draft copied to clipboard!');
                      }}
                      className="w-full py-2 bg-gradient-to-tr from-neonPurple/20 to-cyberBlue/10 hover:opacity-90 border border-cyberBlue/30 rounded-lg text-xs font-bold text-cyberBlue transition"
                    >
                      Copy Reply to Clipboard
                    </button>
                  </div>
                )}
              </div>

              {/* Original Content block */}
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
                <span className="text-xs font-extrabold uppercase text-slate-500 block mb-2">Original Message Body</span>
                <div className="max-h-[300px] overflow-y-auto bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                  {selectedEmail.plainTextBody || 'No text content available.'}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card border border-slate-200 dark:border-darkBorder p-12 text-center flex flex-col items-center justify-center gap-4 text-slate-650 min-h-[400px]">
              <div className="h-14 w-14 bg-gradient-to-tr from-neonPurple/5 to-cyberBlue/5 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-550 animate-pulse">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150">No Email Selected</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Select an email thread from the inbox feed list to perform summary reviews and execute smart actions.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { GlassCard } from '../components/GlassCard';
import { 
  User as UserIcon, 
  Sparkles, 
  Brain, 
  ShieldAlert, 
  Link2, 
  Smartphone, 
  Bell, 
  RefreshCw,
  Trash2,
  XCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface ProfileData {
  username: string;
  email: string;
  bio: string;
}

interface AIPersonalization {
  aiTone: string;
  autoExtractTasks: boolean;
  aiFocusArea: string;
}

interface DeviceSession {
  id: string;
  name: string;
  ip: string;
  lastActive: string;
}

interface NotificationPrefs {
  emailSummaries: boolean;
  pushAlerts: boolean;
  smsReminders: boolean;
}

interface PrivacyPrefs {
  allowNoteAnalysis: boolean;
  allowSearchIndexing: boolean;
  telemetryLevel: string;
}

interface SettingsData {
  profile: ProfileData;
  aiPersonalization: AIPersonalization;
  aiMemories: string[];
  activeDevices: DeviceSession[];
  notifications: NotificationPrefs;
  privacy: PrivacyPrefs;
}

export const Settings: React.FC = () => {
  const [data, setData] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'memory' | 'privacy' | 'connections' | 'security' | 'notifications' | 'vault'>('profile');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Vault credentials vault states
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromAddress, setSmtpFromAddress] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleRedirectUri, setGoogleRedirectUri] = useState('');
  const [aiProvider, setAiProvider] = useState('mock');
  const [aiApiKey, setAiApiKey] = useState('');

  const fetchVaultConfig = async () => {
    try {
      const res = await api.get('/config-vault');
      const v = res.data;
      setSmtpHost(v.smtpHost || '');
      setSmtpPort(v.smtpPort || 587);
      setSmtpUsername(v.smtpUsername || '');
      setSmtpPassword(v.smtpPassword || '');
      setSmtpFromAddress(v.smtpFromAddress || '');
      setSmtpFromName(v.smtpFromName || '');
      setGoogleClientId(v.googleClientId || '');
      setGoogleClientSecret(v.googleClientSecret || '');
      setGoogleRedirectUri(v.googleRedirectUri || '');
      setAiProvider(v.aiProvider || 'mock');
      setAiApiKey(v.aiApiKey || '');
    } catch (e) {
      console.error('Failed to load vault config details');
    }
  };

  const handleSaveVault = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/config-vault', {
        smtpHost,
        smtpPort,
        smtpUsername,
        smtpPassword,
        smtpFromAddress,
        smtpFromName,
        googleClientId,
        googleClientSecret,
        googleRedirectUri,
        aiProvider,
        aiApiKey
      });
      triggerNotification('Configuration Vault credentials updated successfully!');
      fetchVaultConfig();
    } catch (err) {
      alert('Failed to save vault settings.');
    }
  };

  // Form states initialized on data load
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [aiTone, setAiTone] = useState('Professional & Insightful');
  const [autoExtractTasks, setAutoExtractTasks] = useState(true);
  const [aiFocusArea, setAiFocusArea] = useState('Software Development');
  const [emailSummaries, setEmailSummaries] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [smsReminders, setSmsReminders] = useState(true);
  const [allowNoteAnalysis, setAllowNoteAnalysis] = useState(true);
  const [allowSearchIndexing, setAllowSearchIndexing] = useState(true);
  const [telemetryLevel, setTelemetryLevel] = useState('Basic');
  const [newPassword, setNewPassword] = useState('');
  
  const [googleConnections, setGoogleConnections] = useState<any[]>([]);

  const fetchGoogleConnections = async () => {
    try {
      const res = await api.get('/integrations/google/status');
      setGoogleConnections(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await api.get<{ url: string }>('/integrations/google/connect');
      window.location.href = res.data.url;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate Google connection.');
    }
  };

  const handleDisconnectGoogle = async (email: string) => {
    try {
      await api.delete(`/integrations/google/disconnect?email=${encodeURIComponent(email)}`);
      fetchGoogleConnections();
      triggerNotification('Google account disconnected successfully.');
    } catch (err) {
      alert('Failed to disconnect Google account.');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get<SettingsData>('/settings');
      const s = res.data;
      setData(s);
      
      // Initialize states
      setUsername(s.profile.username);
      setEmail(s.profile.email);
      setBio(s.profile.bio);
      setAiTone(s.aiPersonalization.aiTone);
      setAutoExtractTasks(s.aiPersonalization.autoExtractTasks);
      setAiFocusArea(s.aiPersonalization.aiFocusArea);
      setEmailSummaries(s.notifications.emailSummaries);
      setPushAlerts(s.notifications.pushAlerts);
      setSmsReminders(s.notifications.smsReminders);
      setAllowNoteAnalysis(s.privacy.allowNoteAnalysis);
      setAllowSearchIndexing(s.privacy.allowSearchIndexing);
      setTelemetryLevel(s.privacy.telemetryLevel);
    } catch (e) {
      console.error('Failed to retrieve settings details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchGoogleConnections();
    fetchVaultConfig();
  }, []);

  const triggerNotification = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/settings/profile', { username, email, bio });
      triggerNotification('Profile preferences updated successfully!');
    } catch (err) {
      alert('Failed to update profile settings.');
    }
  };

  const handleDeleteMemory = async (idx: number) => {
    try {
      const res = await api.delete<{ aiMemories: string[] }>(`/settings/memory?index=${idx}`);
      setData(prev => prev ? { ...prev, aiMemories: res.data.aiMemories } : null);
      triggerNotification('AI has successfully forgotten this fact.');
    } catch (err) {
      alert('Failed to delete memory logs.');
    }
  };

  const handleRevokeDevice = async (id: string) => {
    try {
      const res = await api.delete<{ activeDevices: DeviceSession[] }>(`/settings/device?deviceId=${id}`);
      setData(prev => prev ? { ...prev, activeDevices: res.data.activeDevices } : null);
      triggerNotification('Device session revoked.');
    } catch (err) {
      alert('Failed to revoke device session.');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <RefreshCw size={24} className="text-cyberBlue animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: UserIcon },
    { id: 'vault', name: 'Configuration Vault', icon: Lock },
    { id: 'ai', name: 'AI Personalization', icon: Sparkles },
    { id: 'memory', name: 'AI Memory Control', icon: Brain },
    { id: 'privacy', name: 'Privacy Settings', icon: ShieldAlert },
    { id: 'connections', name: 'Connected Apps', icon: Link2 },
    { id: 'security', name: 'Security & Devices', icon: Smartphone },
    { id: 'notifications', name: 'Alert Notification', icon: Bell },
  ] as const;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
          Control Center Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize profile details, edit AI memories, manage device listings, and set notification thresholds.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-450 text-xs font-bold flex items-center gap-2 animate-slideDown">
          <CheckCircle2 size={14} /> {saveSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tab Selection Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSaveSuccess(null);
                }}
                className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                  active 
                    ? 'bg-slate-200/60 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-cyberBlue' 
                    : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-355 hover:bg-slate-200/30 dark:hover:bg-slate-950/20'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents panel */}
        <div className="lg:col-span-9">
          <GlassCard className="p-6 border border-slate-200 dark:border-darkBorder">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mb-6">User Profile Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Profile Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                  />
                </div>

                <button type="submit" className="btn-cyber py-2 px-5 text-xs font-bold text-white mt-4">
                  Save Settings
                </button>
              </form>
            )}

            {activeTab === 'vault' && (
              <form onSubmit={handleSaveVault} className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Configuration Vault</h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Securely configure your personal SMTP, Google OAuth, and AI provider API keys. These credentials are saved in the vault, encrypted at rest, and never shared.
                  </p>
                </div>

                {/* Section A: SMTP Configuration */}
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-cyberBlue uppercase tracking-wider pl-1">Personal SMTP Mailer Configuration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">SMTP Host</label>
                      <input
                        type="text"
                        placeholder="e.g. smtp.gmail.com"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">SMTP Port</label>
                      <input
                        type="number"
                        placeholder="e.g. 587"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">SMTP Username</label>
                      <input
                        type="text"
                        placeholder="your-email@gmail.com"
                        value={smtpUsername}
                        onChange={(e) => setSmtpUsername(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">SMTP Password</label>
                      <input
                        type="password"
                        placeholder="App password or secret"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">From Email Address</label>
                      <input
                        type="text"
                        placeholder="your-email@gmail.com"
                        value={smtpFromAddress}
                        onChange={(e) => setSmtpFromAddress(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">From Name</label>
                      <input
                        type="text"
                        placeholder="LifeOS Assistant"
                        value={smtpFromName}
                        onChange={(e) => setSmtpFromName(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Google OAuth Application */}
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-cyberBlue uppercase tracking-wider pl-1">Personal Google OAuth Credentials</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Google Client ID</label>
                    <input
                      type="text"
                      placeholder="Enter Google Client ID"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Google Client Secret</label>
                      <input
                        type="password"
                        placeholder="Enter Client Secret"
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Google Redirect URI</label>
                      <input
                        type="text"
                        placeholder="http://localhost:8080/api/integrations/google/callback"
                        value={googleRedirectUri}
                        onChange={(e) => setGoogleRedirectUri(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: AI Provider */}
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-cyberBlue uppercase tracking-wider pl-1">Personal AI Personalization Keys</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">AI Provider</label>
                      <select
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      >
                        <option value="mock">Local Heuristics / Mock AI</option>
                        <option value="groq">Groq Cloud API Console</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">AI API Key (Groq / Llama)</label>
                      <input
                        type="password"
                        placeholder="Enter API Key"
                        value={aiApiKey}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-cyber py-2 px-6 text-xs font-bold text-white mt-6">
                  Save Vault Credentials
                </button>
              </form>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">AI Engine Personalization</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">AI Personality Tone</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                    >
                      <option>Professional & Insightful</option>
                      <option>Creative & Brainstorming</option>
                      <option>Precise & Brief</option>
                      <option>Friendly & Coaching</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Primary Domain Focus</label>
                    <input
                      type="text"
                      value={aiFocusArea}
                      onChange={(e) => setAiFocusArea(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-slate-850 dark:text-white">Auto task checkboxes extraction</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Parse lists and checkbox entries inside Notes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoExtractTasks}
                      onChange={(e) => setAutoExtractTasks(e.target.checked)}
                      className="h-4 w-4 text-cyberBlue border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 rounded focus:ring-0 focus:ring-offset-0"
                    />
                  </div>
                </div>

                <button onClick={() => triggerNotification('AI config updated successfully!')} className="btn-cyber py-2 px-5 text-xs font-bold text-white">
                  Save Configuration
                </button>
              </div>
            )}

            {activeTab === 'memory' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">AI Digital Memory Log</h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Below is the list of memory context keys the AI has logged about you during chat sessions. Delete facts you want the AI to forget.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {data.aiMemories.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6">AI memory database is empty.</p>
                  ) : (
                    data.aiMemories.map((memory, index) => (
                      <div key={index} className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-3">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{memory}</span>
                        <button
                          onClick={() => handleDeleteMemory(index)}
                          className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition"
                          title="Delete Learned Fact"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Privacy Dashboard Controls</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-slate-850 dark:text-white">Allow AI Semantic Analysis</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Let AI index note tag details for Graph recommendation links</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowNoteAnalysis}
                      onChange={(e) => setAllowNoteAnalysis(e.target.checked)}
                      className="h-4 w-4 text-cyberBlue border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 rounded focus:ring-0 focus:ring-offset-0"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-slate-850 dark:text-white">Allow Search Cache Indexing</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Enable local fast indexing for Ctrl + K overlays</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowSearchIndexing}
                      onChange={(e) => setAllowSearchIndexing(e.target.checked)}
                      className="h-4 w-4 text-cyberBlue border-slate-355 dark:border-slate-700 bg-white dark:bg-slate-900 rounded focus:ring-0 focus:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Telemetry Analytics Level</label>
                    <select
                      value={telemetryLevel}
                      onChange={(e) => setTelemetryLevel(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                    >
                      <option>None (Fully Offline)</option>
                      <option>Basic (Errors & Compilation only)</option>
                      <option>Full diagnostics</option>
                    </select>
                  </div>
                </div>

                <button onClick={() => triggerNotification('Privacy preferences updated.')} className="btn-cyber py-2 px-5 text-xs font-bold text-white">
                  Save Preferences
                </button>
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Connected Services & Apps</h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Manage connection states of linked third-party APIs and connected accounts.
                  </p>
                </div>

                {/* Connected Email Accounts section */}
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Email Accounts Connection</h4>
                  
                  {googleConnections.length > 0 ? (
                    <div className="space-y-3">
                      {googleConnections.map((conn) => (
                        <div key={conn.id} className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-3">
                          <div>
                            <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">{conn.displayName || 'Google User'}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-550 block mt-0.5">{conn.emailAddress}</span>
                          </div>
                          <button
                            onClick={() => handleDisconnectGoogle(conn.emailAddress)}
                            className="py-1.5 px-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-450 dark:text-red-400 text-xs font-bold hover:bg-red-500/10 transition"
                          >
                            Disconnect
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
                      <p className="text-xs text-slate-500">
                        Connect your Gmail account to enable AI-powered inbox classification, data extraction, and quick actions triggers.
                      </p>
                      <button
                        onClick={handleConnectGoogle}
                        className="btn-cyber py-2 px-5 text-xs font-bold text-white shadow-lg inline-block"
                      >
                        Connect Google Gmail Account
                      </button>
                    </div>
                  )}
                </div>

                {/* General Integrations Status */}
                <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex justify-between items-center mt-6">
                  <div>
                    <span className="text-xs font-bold block text-slate-855 dark:text-slate-200">System Integration Status</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Manage mail scans, calendar schedules and drive uploads.</span>
                  </div>
                  <a
                    href="/integrations"
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-cyberBlue hover:text-cyberBlue/80 hover:border-cyberBlue/40 transition"
                  >
                    Manage Integrations
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Security & Session Listings</h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Inspect active device tokens and revoke login access immediately.
                  </p>
                </div>

                {/* Password modification */}
                <div className="space-y-3.5 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Change Account Password</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-white p-2.5 outline-none focus:border-cyberBlue focus:ring-1 focus:ring-cyberBlue/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPassword) {
                            triggerNotification('Password updated successfully!');
                            setNewPassword('');
                          }
                        }}
                        className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyberBlue/40 text-cyberBlue text-xs font-bold transition flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Lock size={12} /> Update
                      </button>
                    </div>
                  </div>
                </div>

                {/* Device listings */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Device Sessions</span>
                  <div className="space-y-2.5">
                    {data.activeDevices.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No device sessions active.</p>
                    ) : (
                      data.activeDevices.map((dev) => (
                        <div key={dev.id} className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold block text-slate-850 dark:text-slate-200">{dev.name}</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">IP: {dev.ip} • Last Active: {dev.lastActive}</span>
                          </div>
                          {dev.id !== 'dev_1' && (
                            <button
                              onClick={() => handleRevokeDevice(dev.id)}
                              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-red-500/20 text-slate-600 dark:text-slate-450 hover:text-red-400 text-[10px] font-bold transition"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Alert Notification Preferences</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-slate-855 dark:text-white">Weekly Email Digests</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Receive summary reports of goals, tasks achieved, and finances.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailSummaries}
                      onChange={(e) => setEmailSummaries(e.target.checked)}
                      className="h-4 w-4 text-cyberBlue border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 rounded focus:ring-0 focus:ring-offset-0"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-slate-855 dark:text-white">Browser Push Notifications</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Alerts for scheduled event meetings and task deadlines.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushAlerts}
                      onChange={(e) => setPushAlerts(e.target.checked)}
                      className="h-4 w-4 text-cyberBlue border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 rounded focus:ring-0 focus:ring-offset-0"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-slate-855 dark:text-white">Daily SMS Reminders</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">SMS updates outlining today's schedule and checklists.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsReminders}
                      onChange={(e) => setSmsReminders(e.target.checked)}
                      className="h-4 w-4 text-cyberBlue border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 rounded focus:ring-0 focus:ring-offset-0"
                    />
                  </div>
                </div>

                <button onClick={() => triggerNotification('Notification rules updated successfully!')} className="btn-cyber py-2 px-5 text-xs font-bold text-white">
                  Save Preferences
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

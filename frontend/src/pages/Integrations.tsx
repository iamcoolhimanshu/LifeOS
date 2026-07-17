import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { GlassCard } from '../components/GlassCard';
import { Plug, RefreshCw, CheckCircle2, AlertCircle, Mail, Calendar, HardDrive, ArrowRight } from 'lucide-react';
import { useSearchStore } from '../stores/useSearchStore';

interface IntegrationStatus {
  gmailConnected: boolean;
  driveConnected: boolean;
  calendarConnected: boolean;
}

export const Integrations: React.FC = () => {
  const [statuses, setStatuses] = useState<IntegrationStatus>({
    gmailConnected: false,
    driveConnected: false,
    calendarConnected: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [syncingService, setSyncingService] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ service: string; items: number } | null>(null);

  const fetchStatuses = async () => {
    try {
      const res = await api.get<IntegrationStatus>('/integrations');
      setStatuses(res.data);
    } catch (e) {
      console.error('Failed to load integration states');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleConnect = async (service: string) => {
    try {
      const res = await api.post<{ connected: boolean }>(`/integrations/connect?service=${service}`);
      setStatuses(prev => ({
        ...prev,
        [`${service}Connected`]: res.data.connected
      }));
    } catch (e) {
      alert('Connection attempt failed.');
    }
  };

  const handleSync = async (service: string) => {
    setSyncingService(service);
    setSyncResult(null);
    try {
      const res = await api.post<{ syncedItems: number }>(`/integrations/sync?service=${service}`);
      setSyncResult({ service, items: res.data.syncedItems });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Sync failed.');
    } finally {
      setSyncingService(null);
    }
  };

  const services = [
    {
      id: 'gmail',
      name: 'Google Gmail',
      description: 'Automatically scan emails for important action items, code standup files, and invoice bills.',
      icon: Mail,
      color: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-500',
      connected: statuses.gmailConnected
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Sync your professional schedule and automatically map review meetings onto your Calendar panel.',
      icon: Calendar,
      color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-500',
      connected: statuses.calendarConnected
    },
    {
      id: 'drive',
      name: 'Google Drive',
      description: 'Link folders to automatically extract, catalog, tag and index your Smart Documents files.',
      icon: HardDrive,
      color: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-500',
      connected: statuses.driveConnected
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
          <Plug className="text-cyberBlue" size={24} /> Sync Integrations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Connect Gmail, Calendar, and Drive to feed and sync your personal operating system in the background.
        </p>
      </div>

      {/* Sync Success notification */}
      {syncResult && (
        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 flex items-center gap-3 text-green-400 text-xs font-semibold animate-slideDown">
          <CheckCircle2 size={16} />
          <span>
            Successfully synchronized <strong>{syncResult.service.toUpperCase()}</strong>. Imported {syncResult.items} items to note cards/events!
          </span>
        </div>
      )}

      {/* Connection grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          const isSyncing = syncingService === service.id;
          return (
            <GlassCard key={service.id} className="p-6 flex flex-col justify-between h-72 border border-slate-200 dark:border-darkBorder">
              <div>
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${service.color} w-fit`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-4">{service.name}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-2">{service.description}</p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {service.connected ? (
                  <>
                    <div className="flex justify-between items-center text-[10px] font-bold text-green-500 pl-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} /> Connected
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSync(service.id)}
                        disabled={isSyncing}
                        className="flex-1 btn-cyber py-2 px-3 text-xs font-bold text-white flex items-center justify-center gap-1.5"
                      >
                        {isSyncing ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                      </button>
                      <button
                        onClick={() => handleConnect(service.id)}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 text-slate-400 hover:text-red-400 hover:border-red-500/30 text-[10px] font-bold transition-all duration-200"
                        title="Disconnect Integration"
                      >
                        Disconnect
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pl-1">
                      <span className="flex items-center gap-1">
                        <AlertCircle size={12} /> Disconnected
                      </span>
                    </div>
                    <button
                      onClick={() => handleConnect(service.id)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-cyberBlue/40 text-cyberBlue hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      Connect Sync <ArrowRight size={12} />
                    </button>
                  </>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

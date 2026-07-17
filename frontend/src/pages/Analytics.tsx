import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { GlassCard } from '../components/GlassCard';
import { BarChart3, TrendingUp, Calendar, RefreshCw, Activity, Layers } from 'lucide-react';

interface AnalyticsData {
  totalNotes: number;
  totalDocuments: number;
  totalTasks: number;
  categoryDistribution: Record<string, number>;
  taskPriorities: Record<string, number>;
  taskStatuses: Record<string, number>;
  noteVelocity: Array<{ day: string; count: number }>;
  productivityTrend: number[];
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<AnalyticsData>('/analytics');
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch analytics statistics data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <RefreshCw size={24} className="text-cyberBlue animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 font-semibold">{error || 'Failed to load analytics.'}</p>
        <button onClick={fetchAnalytics} className="btn-cyber px-4 py-2 mt-4 text-xs font-bold text-white">Retry</button>
      </div>
    );
  }

  // Visual coordinates builders for custom SVG charts
  const maxVelocity = Math.max(...data.noteVelocity.map(v => v.count), 1);
  const totalCategoriesCount = (Object.values(data.categoryDistribution) as number[]).reduce((a: number, b: number) => a + b, 0) || 1;

  // Colors mapping for category donut slices
  const categoryColors = ['#a855f7', '#06b6d4', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
  const categoriesList = Object.entries(data.categoryDistribution) as [string, number][];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <BarChart3 className="text-cyberBlue" size={24} /> Advanced Brain Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual productivity indices, task prioritization matrices, content velocity tracking, and category shares.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyberBlue/40 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all active:scale-95"
        >
          <RefreshCw size={12} /> Sync Stats
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Knowledge Volume</span>
            <span className="text-xl font-black text-slate-800 dark:text-white">{data.totalNotes + data.totalDocuments} Items</span>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Weekly Note Velocity</span>
            <span className="text-xl font-black text-slate-800 dark:text-white">
              {data.noteVelocity.reduce((sum, item) => sum + item.count, 0)} Notes / wk
            </span>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recent Efficiency Score</span>
            <span className="text-xl font-black text-slate-800 dark:text-white">
              {data.productivityTrend[data.productivityTrend.length - 1]}% index
            </span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Line Chart: Productivity index score trend */}
        <GlassCard className="p-6">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-450 dark:text-emerald-400" /> Productivity Efficiency Trend (7D)
          </h3>
          <div className="w-full">
            <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="gradient-line" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[0, 50, 100, 150].map((yVal, i) => (
                <line
                  key={i}
                  x1="30"
                  y1={yVal + 20}
                  x2="480"
                  y2={yVal + 20}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Y Axis indices */}
              <text x="5" y="24" fill="#64748b" fontSize="8" fontWeight="bold">100%</text>
              <text x="5" y="99" fill="#64748b" fontSize="8" fontWeight="bold">50%</text>
              <text x="5" y="174" fill="#64748b" fontSize="8" fontWeight="bold">0%</text>

              {/* Draw Area Fill */}
              <path
                d={`M 40,170 
                    ${data.productivityTrend.map((val, idx) => {
                      const x = 40 + idx * 70;
                      // Mapping 0-100 to y position 170-20
                      const y = 170 - (val / 100) * 150;
                      return `L ${x},${y}`;
                    }).join(' ')} 
                    L 460,170 Z`}
                fill="url(#gradient-line)"
              />

              {/* Draw Trend Line */}
              <path
                d={data.productivityTrend.map((val, idx) => {
                  const x = 40 + idx * 70;
                  const y = 170 - (val / 100) * 150;
                  return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points nodes */}
              {data.productivityTrend.map((val, idx) => {
                const x = 40 + idx * 70;
                const y = 170 - (val / 100) * 150;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={x} y={y - 8} className="fill-slate-700 dark:fill-white" fontSize="8" textAnchor="middle" fontWeight="bold">
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* X Axis days labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <text key={idx} x={40 + idx * 70} y="192" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">
                  {day}
                </text>
              ))}
            </svg>
          </div>
        </GlassCard>

        {/* SVG Bar Chart: Notes creation velocity */}
        <GlassCard className="p-6">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Calendar size={14} className="text-purple-450 dark:text-purple-400" /> Daily Note Creation Velocity
          </h3>
          <div className="w-full">
            <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
              {/* Horizontal Grid Lines */}
              {[0, 50, 100, 150].map((yVal, i) => (
                <line
                  key={i}
                  x1="30"
                  y1={yVal + 20}
                  x2="480"
                  y2={yVal + 20}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Y Axis labels */}
              <text x="5" y="24" fill="#64748b" fontSize="8" fontWeight="bold">{maxVelocity}</text>
              <text x="5" y="99" fill="#64748b" fontSize="8" fontWeight="bold">{Math.round(maxVelocity / 2)}</text>
              <text x="5" y="174" fill="#64748b" fontSize="8" fontWeight="bold">0</text>

              {/* Render Bars */}
              {data.noteVelocity.map((item, idx) => {
                const barWidth = 32;
                const x = 40 + idx * 60;
                // Scale height: y mapping from 170 down to 20
                const barHeight = (item.count / maxVelocity) * 150;
                const y = 170 - barHeight;

                return (
                  <g key={idx}>
                    <rect
                      x={x - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill="url(#gradient-purple-bar)"
                      className="transition-all duration-300 hover:opacity-85"
                    />
                    <text x={x} y={y - 6} className="fill-slate-700 dark:fill-white" fontSize="8" textAnchor="middle" fontWeight="bold">
                      {item.count}
                    </text>
                    <text x={x} y="192" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">
                      {item.day}
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="gradient-purple-bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </GlassCard>

        {/* Categories Distribution visual list */}
        <GlassCard className="p-6">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6">
            Category Share Breakdown
          </h3>
          <div className="space-y-4">
            {categoriesList.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">No categories mapped yet.</p>
            ) : (
              categoriesList.map(([catName, val], idx) => {
                const color = categoryColors[idx % categoryColors.length];
                const pct = Math.round((val / totalCategoriesCount) * 100);
                return (
                  <div key={catName} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        {catName}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{val} items ({pct}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Priority Matrix card */}
        <GlassCard className="p-6">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6">
            Task Priority Matrix
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {['HIGH', 'MEDIUM', 'LOW'].map((priority) => {
              const count = data.taskPriorities[priority] || 0;
              let color = 'bg-red-500/10 text-red-500 border-red-500/20';
              if (priority === 'MEDIUM') color = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
              if (priority === 'LOW') color = 'bg-blue-500/10 text-blue-500 border-blue-500/20';

              return (
                <div key={priority} className={`p-4 rounded-2xl border ${color}`}>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest block">{priority}</span>
                  <span className="text-2xl font-black block mt-2">{count}</span>
                  <span className="text-[9px] font-semibold text-slate-500 block mt-1">active tasks</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

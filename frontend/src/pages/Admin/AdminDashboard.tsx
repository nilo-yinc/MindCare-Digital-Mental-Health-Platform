import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, ShieldAlert, FileCheck, Map as MapIcon, TrendingDown, Download, Search, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { token } = useAuth();
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'department' | 'year'>('department');
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const heatmapData = await apiRequest<any[]>('/api/admin/heatmap', { token });
      const reportData = await apiRequest<any>('/api/admin/report', { token });
      setHeatmap(heatmapData);
      setReport(reportData);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time polling
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isLive, fetchData]);

  // Year-grouped mock data
  const yearData = [
    { name: '1st Year', stressLevel: 42, riskStatus: 'Low' },
    { name: '2nd Year', stressLevel: 55, riskStatus: 'Moderate' },
    { name: '3rd Year', stressLevel: 68, riskStatus: 'High' },
    { name: '4th Year', stressLevel: 45, riskStatus: 'Moderate' },
    { name: 'PG', stressLevel: 72, riskStatus: 'High' },
  ];

  const displayData = viewMode === 'department' ? heatmap : yearData;

  const handleExport = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      platform: 'MindCare Global Sanctuary — Enterprise Edition',
      heatmapData: heatmap,
      reportSummary: report,
      yearWiseBreakdown: yearData,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindCare_System_Report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('System Report exported successfully!');
  };

  const stats = [
    { label: 'Engagement Rate', value: report ? `${Math.round((report.totalStudentsEngaged / 500) * 100)}%` : '82%', icon: Users, color: '#00F5D4' },
    { label: 'Active Risks', value: report?.topRiskZones?.length?.toString() || '12', icon: ShieldAlert, color: '#EF4444' },
    { label: 'Compliance', value: report?.complianceStatus === 'Fully Compliant' ? '100%' : '95%', icon: FileCheck, color: '#3B82F6' },
    { label: 'Stress Trend', value: '-4.2%', icon: TrendingDown, color: '#10B981' },
  ];

  if (loading) return <div className="min-h-screen bg-[#0A0F14] flex items-center justify-center text-white text-2xl font-bold tracking-widest animate-pulse">SYNCHRONIZING MINDCARE CORE...</div>;

  return (
    <div className="min-h-screen bg-[#0A0F14] text-slate-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Institutional Dashboard</h1>
            <p className="text-slate-400 mt-2">Aggregated stress heatmaps & wellness reporting.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleExport} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center font-bold text-xs uppercase tracking-widest">
              <Download className="w-4 h-4 mr-2" /> Export System Report
            </button>
            <button
              onClick={() => { setIsLive(!isLive); toast.success(isLive ? 'Live mode off' : 'Live mode on — refreshing every 5s'); }}
              className={`px-6 py-3 rounded-full transition-all flex items-center font-bold text-xs uppercase tracking-widest ${isLive ? 'bg-green-500 text-white animate-pulse' : 'bg-[#00F5D4] text-[#0A0F14] hover:bg-[#00D1B2]'}`}
            >
              {isLive ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
              {isLive ? 'Live Monitoring' : 'Real-time Analytics'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#141C24] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${stat.color}10` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stress Heatmap */}
          <div className="lg:col-span-2 bg-[#141C24] border border-white/5 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <MapIcon className="w-6 h-6 mr-3 text-[#00F5D4]" /> Institutional Stress Heatmap
              </h2>
              <div className="flex bg-[#0A0F14] rounded-full p-1 border border-white/5">
                <button onClick={() => setViewMode('department')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'department' ? 'bg-[#141C24] text-white' : 'text-slate-500 hover:text-white'}`}>Department</button>
                <button onClick={() => setViewMode('year')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'year' ? 'bg-[#141C24] text-white' : 'text-slate-500 hover:text-white'}`}>Year</button>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#141C24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="stressLevel" radius={[10, 10, 0, 0]}>
                    {displayData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.stressLevel > 60 ? '#EF4444' : entry.stressLevel > 40 ? '#F59E0B' : '#00F5D4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              {displayData.map((dept: any, i: number) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-[#0A0F14]/50 border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">{dept.name}</div>
                  <div className={`text-lg font-bold ${dept.riskStatus === 'High' ? 'text-red-500' : dept.riskStatus === 'Moderate' ? 'text-amber-400' : 'text-[#00F5D4]'}`}>{dept.riskStatus}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Accreditation Report */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#141C24] to-[#0A0F14] border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FileCheck className="w-24 h-24 text-[#00F5D4]" /></div>
              <h3 className="text-xl font-bold text-white mb-6">Accreditation Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-slate-400 text-sm">Engagement</span>
                  <span className="text-white font-bold">{report?.totalStudentsEngaged} Students</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-slate-400 text-sm">AI Interventions</span>
                  <span className="text-white font-bold">{report?.totalAIInterventions}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-slate-400 text-sm">Wellness Score</span>
                  <span className="text-[#00F5D4] font-bold">{report?.averageWellnessScore}/100</span>
                </div>
                <div className="mt-8 p-4 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/20">
                  <div className="text-[#00F5D4] text-xs font-bold uppercase tracking-widest mb-1">Status</div>
                  <div className="text-white text-sm font-medium">{report?.complianceStatus}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#141C24] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-red-500" /> Departmental Risk Zones
              </h3>
              <div className="space-y-3">
                {report?.topRiskZones?.map((zone: string, i: number) => (
                  <div key={i} className="flex items-center p-3 rounded-xl bg-[#0A0F14]/50 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-3" />
                    <span className="text-sm font-medium">{zone}</span>
                    <Search className="w-4 h-4 ml-auto text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

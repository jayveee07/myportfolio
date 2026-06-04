import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Clock, Globe, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Visit {
  id: string;
  visitor_id: string;
  email?: string;
  ip?: string;
  path: string;
  user_agent?: string;
  timestamp?: string;
  last_active?: string;
}

export const AdminAnalytics = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('visits')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);
      if (data) setVisits(data as Visit[]);
      setLoading(false);
    };
    load();
  }, []);

  const uniqueVisitors = new Set(visits.map(v => v.visitor_id)).size;
  const uniqueEmails = new Set(visits.map(v => v.email).filter(Boolean)).size;
  const pageViews: Record<string, number> = {};
  visits.forEach(v => { pageViews[v.path] = (pageViews[v.path] || 0) + 1; });
  const topPages = Object.entries(pageViews).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const dailyVisits = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    visits.forEach(v => {
      if (v.timestamp) {
        const key = v.timestamp.slice(0, 10);
        if (days[key] !== undefined) days[key]++;
      }
    });
    return Object.entries(days).map(([date, count]) => ({
      date: date.slice(5),
      views: count,
    }));
  }, [visits]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary mb-2">Analytics</h1>
        <p className="text-secondary font-bold">Visitor tracking and engagement data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><User size={20} /></div>
          </div>
          <p className="text-3xl font-black text-primary mb-1">{uniqueVisitors}</p>
          <p className="text-sm font-bold text-secondary uppercase tracking-wider">Unique Visitors</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Mail size={20} /></div>
          </div>
          <p className="text-3xl font-black text-primary mb-1">{uniqueEmails}</p>
          <p className="text-sm font-bold text-secondary uppercase tracking-wider">Identified Users</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center"><Globe size={20} /></div>
          </div>
          <p className="text-3xl font-black text-primary mb-1">{visits.length}</p>
          <p className="text-sm font-bold text-secondary uppercase tracking-wider">Total Page Views</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
        <h2 className="text-lg font-black text-primary mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-accent" /> Daily Page Views (30 days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyVisits} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--color-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
                labelStyle={{ color: 'var(--color-secondary)' }}
              />
              <Area type="monotone" dataKey="views" stroke="var(--color-accent)" fill="url(#viewsGradient)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--color-accent)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2"><Clock size={18} className="text-accent" /> Top Pages</h2>
          <div className="space-y-3">
            {topPages.map(([path, count]) => (
              <div key={path} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-bold text-secondary">{path}</span>
                <span className="text-sm font-black text-primary">{count} views</span>
              </div>
            ))}
            {topPages.length === 0 && <p className="text-sm text-secondary font-bold">No data yet</p>}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2"><User size={18} className="text-accent" /> Recent Visitors</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {visits.slice(0, 20).map(v => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-bold text-primary truncate max-w-[200px]">{v.email || v.visitor_id.slice(0, 12)}</p>
                  <p className="text-[10px] text-secondary font-bold">{v.path} • {v.timestamp ? new Date(v.timestamp).toLocaleDateString() : 'unknown'}</p>
                </div>
              </div>
            ))}
            {visits.length === 0 && <p className="text-sm text-secondary font-bold">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

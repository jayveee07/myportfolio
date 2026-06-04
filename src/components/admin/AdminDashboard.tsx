import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Eye, Mail, Layers, Users, Activity, BarChart3, MessageCircle, BookOpen, TrendingUp } from 'lucide-react';
import { getStats, subscribeToActiveVisitors, getAllTestimonials, getBlogPosts } from '../../lib/supabase-data';
import { supabase } from '../../lib/supabase';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Stats {
  conversations: number;
  visits: number;
  messages: number;
  projects: number;
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: typeof MessageSquare; label: string; value: string | number; color: string }) => (
  <div className="bg-surface rounded-2xl border border-border p-6 transition-all hover:shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-black text-primary mb-1">{value}</p>
    <p className="text-sm font-bold text-secondary uppercase tracking-wider">{label}</p>
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ conversations: 0, visits: 0, messages: 0, projects: 0 });
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [visits, setVisits] = useState<{ timestamp?: string }[]>([]);

  useEffect(() => {
    getStats().then(setStats);
    const unsub = subscribeToActiveVisitors(setActiveCount);
    getAllTestimonials().then(list => setPendingCount(list.filter(t => !t.approved).length));
    getBlogPosts().then(list => setBlogCount(list.length));
    supabase.from('visits').select('timestamp').order('timestamp', { ascending: false }).limit(500).then(({ data }) => {
      if (data) setVisits(data as { timestamp?: string }[]);
    });
    return () => unsub();
  }, []);

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary mb-2">Dashboard</h1>
        <p className="text-secondary font-bold">Overview of your portfolio activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Active Visitors" value={activeCount} color="bg-emerald-500" />
        <StatCard icon={MessageSquare} label="Conversations" value={stats.conversations} color="bg-accent" />
        <StatCard icon={Mail} label="Messages" value={stats.messages} color="bg-blue-500" />
        <StatCard icon={Eye} label="Total Visits" value={stats.visits} color="bg-violet-500" />
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
        <h2 className="text-lg font-black text-primary mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-accent" /> Daily Page Views (30 days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyVisits} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dashViewsGradient" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="views" stroke="var(--color-accent)" fill="url(#dashViewsGradient)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--color-accent)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <QuickAction
              icon={MessageSquare}
              label="View Inbox"
              desc="Check and respond to messages"
              color="text-accent"
              bgColor="bg-accent/5"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: 'inbox' }))}
            />
            <QuickAction
              icon={Layers}
              label="Manage Content"
              desc="Update experiences, skills, education, and projects"
              color="text-blue-500"
              bgColor="bg-blue-50"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: 'content' }))}
            />
            <QuickAction
              icon={BarChart3}
              label="View Analytics"
              desc="Track visitors and engagement"
              color="text-violet-500"
              bgColor="bg-violet-50"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: 'analytics' }))}
            />
            <QuickAction
              icon={MessageCircle}
              label="Review Testimonials"
              desc={pendingCount > 0 ? `${pendingCount} pending approval` : 'Manage testimonials'}
              color="text-emerald-500"
              bgColor="bg-emerald-50"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: 'testimonials' }))}
            />
            <QuickAction
              icon={BookOpen}
              label="Manage Blog"
              desc={blogCount > 0 ? `${blogCount} posts published` : 'Create your first post'}
              color="text-orange-500"
              bgColor="bg-orange-50"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: 'blog' }))}
            />
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
            <Layers size={18} className="text-accent" />
            Content Summary
          </h2>
          <div className="space-y-4">
            <SummaryRow label="Projects" value={stats.projects} />
            <SummaryRow label="Conversations" value={stats.conversations} />
            <SummaryRow label="Total Messages" value={stats.messages} />
            <SummaryRow label="Total Visits" value={stats.visits} />
            <SummaryRow label="Blog Posts" value={blogCount} />
            <SummaryRow label="Pending Testimonials" value={pendingCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, desc, color, bgColor, onClick }: {
  icon: typeof MessageSquare;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-alt hover:bg-surface-alt/80 transition-all group text-left">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={18} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-black text-primary">{label}</p>
      <p className="text-xs font-bold text-secondary">{desc}</p>
    </div>
  </button>
);

const SummaryRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
    <span className="text-sm font-bold text-secondary">{label}</span>
    <span className="text-lg font-black text-primary">{value}</span>
  </div>
);

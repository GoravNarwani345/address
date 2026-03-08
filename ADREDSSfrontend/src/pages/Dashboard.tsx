import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import MarketChart from '../components/MarketChart';
import InquiryList from '../components/InquiryList';
import { TrendingUp, Building, AlertCircle, ShieldCheck, PieChart, Activity, Mail } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'market' | 'leads'>('market');
    const [professionalStats, setProfessionalStats] = useState<any>(null);
    const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y' | 'ALL'>('6M');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const u = JSON.parse(userStr);
                setUser(u);
                // Default to leads for professionals
                if (u.role === 'seller' || u.role === 'broker') {
                    setActiveTab('leads');
                }
            } catch (e) {
                console.error('Failed to parse user', e);
            }
        }

        const fetchStats = async () => {
            try {
                const data = await api.analytics.getMarketStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch market stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getFilteredTrends = () => {
        if (!stats?.trends) return [];
        const months = { '1M': 1, '6M': 6, '1Y': 12, 'ALL': 999 };
        return stats.trends.slice(-months[timeRange]);
    };

    const isProfessional = user?.role === 'seller' || user?.role === 'broker';

    if (loading) return (
        <div className="pt-32 min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold tracking-widest text-sm">LOADING ANALYTICS</p>
        </div>
    );

    return (
        <div className="pt-28 pb-20 bg-slate-950 min-h-screen text-white px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-2">{isProfessional ? 'Professional Dashboard' : 'Market Intelligence'}</h1>
                        <p className="text-slate-400">Manage your real estate operations and view predictive analytics.</p>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                        <button
                            onClick={() => setActiveTab('market')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'market' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <TrendingUp size={18} />
                            Market Insight
                        </button>
                        {isProfessional && (
                            <button
                                onClick={() => setActiveTab('leads')}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'leads' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Mail size={18} />
                                My Leads
                            </button>
                        )}
                    </div>
                </div>

                {activeTab === 'leads' && isProfessional ? (
                    <div className="grid grid-cols-1 gap-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-primary/20 p-3 rounded-2xl text-primary font-bold">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">Lead Management</h2>
                                <p className="text-slate-500 text-sm">Track and respond to property inquiries from buyers.</p>
                            </div>
                        </div>
                        <InquiryList role={user.role} />

                        {/* Professional Lead Stats */}
                        {professionalStats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                                <StatCard label="Total Leads" value={professionalStats.totalLeads} icon={Mail} />
                                <StatCard label="Pending Response" value={professionalStats.pendingLeads} icon={Activity} color="text-yellow-500" />
                                <StatCard label="Health" value="Good" icon={ShieldCheck} color="text-green-500" />
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <StatCard label="Active Listings" value={stats?.totalListings || 0} icon={Building} delta="+12%" />
                            <StatCard label="Verified Brokers" value={stats?.verifiedBrokers || 0} icon={ShieldCheck} delta="+5%" />
                            <StatCard label="Average Price" value={`PKR ${((stats?.averagePrice || 0) / 1000000).toFixed(1)}M`} icon={TrendingUp} delta="+8%" />
                            <StatCard label="Market Activity" value="Strong" icon={Activity} color="text-green-500" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Chart Area */}
                            <div className="lg:col-span-2 glass p-8 rounded-4xl border-white/5 shadow-2xl min-h-[500px] flex flex-col">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/20 p-3 rounded-2xl text-primary font-bold">
                                            <PieChart size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black">Price Appreciation Trends</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        {(['1M', '6M', '1Y', 'ALL'] as const).map(t => (
                                            <button 
                                                key={t} 
                                                onClick={() => setTimeRange(t)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${t === timeRange ? 'bg-primary text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <MarketChart data={{ ...stats, trends: getFilteredTrends() }} />
                                </div>
                            </div>

                            {/* Side Activity */}
                            <div className="space-y-6">
                                <div className="glass p-8 rounded-4xl border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <TrendingUp size={120} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-6">Investment Insight</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                        Based on current trends in <span className="text-white font-bold underline">Qasimabad, Hyderabad</span>, property values are projected to increase by 4.5% in the next quarter. Verified broker listings sell <span className="text-primary font-bold">15% faster</span> than unverified ones.
                                    </p>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const token = localStorage.getItem('token');
                                                const response = await fetch('http://localhost:5000/api/analytics/download?type=market', {
                                                    method: 'GET',
                                                    headers: {
                                                        'Authorization': `Bearer ${token}`
                                                    }
                                                });
                                                if (!response.ok) throw new Error('Download failed');
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', 'market-report.csv');
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                                window.URL.revokeObjectURL(url);
                                            } catch (error) {
                                                console.error('Download failed:', error);
                                            }
                                        }}
                                        className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                                    >
                                        Download Full Report
                                    </button>
                                </div>

                                <div className="glass p-8 rounded-4xl border-white/5">
                                    <h3 className="text-xl font-bold mb-6">Recent Alerts</h3>
                                    <div className="space-y-4">
                                        <AlertItem title="Price Drop in Latifabad, Hyderabad" time="2h ago" />
                                        <AlertItem title="New House in Qasimabad, Hyderabad" time="5h ago" />
                                        <AlertItem title="Broker Verification Approved" time="1d ago" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, delta, color = 'text-primary' }: any) => (
    <div className="glass p-8 rounded-4xl border-white/5 hover:border-white/10 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-slate-900 border border-white/5 ${color}`}>
                <Icon size={24} />
            </div>
            {delta && <span className="text-green-500 text-xs font-black bg-green-500/10 px-2 py-1 rounded-lg">{delta}</span>}
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black">{value}</p>
    </div>
);

const AlertItem = ({ title, time }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer">
        <div className="mt-1 w-2 h-2 bg-primary rounded-full" />
        <div className="flex-1">
            <p className="text-sm font-bold text-slate-200 group-hover:text-white">{title}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black">{time}</p>
        </div>
        <AlertCircle size={14} className="text-slate-700 group-hover:text-primary transition-colors" />
    </div>
);

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, CheckCircle, XCircle, Loader2, Users, Search, Filter, ExternalLink, Mail, MessageSquare, Clock, Ban, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [pendingOnly, setPendingOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [adminStats, setAdminStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'support'>('users');
    const [messages, setMessages] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = pendingOnly
                ? await api.admin.getPendingVerifications()
                : await api.admin.getUsers();

            if (res.success) {
                setUsers(res.users);
            }

            const statsRes = await api.analytics.getAdminStats();
            if (statsRes.success) {
                setAdminStats(statsRes.data);
            }

            const messagesRes = await api.support.getContactMessages();
            if (messagesRes.success) {
                setMessages(messagesRes.data);
            }
        } catch (err) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pendingOnly]);

    const handleUpdateStatus = async (userId: string, status: 'approved' | 'rejected') => {
        setUpdatingId(userId);
        try {
            const res = await api.admin.updateVerificationStatus({ userId, status });
            if (res.success) {
                toast.success(`User verification ${status}`);
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, verificationStatus: status } : u));
                if (pendingOnly) {
                    setUsers(prev => prev.filter(u => u._id !== userId));
                }
            }
        } catch (err) {
            toast.error('Failed to update verification status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleToggleBlock = async (userId: string, status: 'active' | 'blocked') => {
        setUpdatingId(userId);
        try {
            const res = await api.admin.toggleUserBlock({ userId, status });
            if (res.success) {
                toast.success(`User status updated to ${status}`);
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, status } : u));
            }
        } catch (err) {
            toast.error('Failed to update user status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateMessageStatus = async (messageId: string, status: string) => {
        setUpdatingId(messageId);
        try {
            const res = await api.support.updateMessageStatus(messageId, status);
            if (res.success) {
                toast.success(`Message status updated to ${status}`);
                setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
            }
        } catch (err) {
            toast.error('Failed to update message status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMessages = messages.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pt-28 pb-20 bg-slate-950 min-h-screen text-white px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <ShieldCheck className="text-primary" size={36} />
                            Administrative Control
                        </h1>
                        <p className="text-slate-400">Manage user accounts and verify professional credentials.</p>
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Users size={18} />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'support' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Mail size={18} />
                            Support
                        </button>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder={activeTab === 'users' ? "Search users..." : "Search messages..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 p-3 pl-12 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none"
                            />
                        </div>
                        {activeTab === 'users' && (
                            <button
                                onClick={() => setPendingOnly(!pendingOnly)}
                                className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm ${pendingOnly ? 'bg-primary border-primary text-white shadow-lg' : 'glass border-white/5 text-slate-400 hover:text-white'}`}
                            >
                                <Filter size={18} />
                                {pendingOnly ? 'Reviewing Queue' : 'All Users'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Admin Stats Overview */}
                {adminStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <StatBox label="Total Users" value={adminStats.totalUsers} icon={Users} color="text-blue-500" />
                        <StatBox label="Pending Verifications" value={adminStats.pendingVerifications} icon={ShieldCheck} color="text-yellow-500" />
                        <StatBox label="Active Listings" value={adminStats.totalListings} icon={ExternalLink} color="text-green-500" />
                        <StatBox label="Total Inquiries" value={adminStats.totalInquiries} icon={Users} color="text-purple-500" />
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center p-24">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                ) : activeTab === 'users' ? (
                    filteredUsers.length === 0 ? (
                        <div className="text-center p-24 glass rounded-[3rem] border-white/5">
                            <Users className="mx-auto mb-4 text-slate-700" size={64} />
                            <h3 className="text-2xl font-bold mb-2">No Users Found</h3>
                            <p className="text-slate-500">Your search did not return any results.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredUsers.map((user) => (
                                <div key={user._id} className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-primary font-black text-2xl border border-white/5">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                                        {user.name}
                                                        {user.isVerifiedBroker && <ShieldCheck size={18} className="text-primary" />}
                                                    </h4>
                                                    <p className="text-slate-500">{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Role</p>
                                                    <p className="text-sm font-bold capitalize">{user.role}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Status</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${user.verified ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <p className="text-sm font-bold">{user.verified ? 'Verified Email' : 'Pending Email'}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Account</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${user.status === 'blocked' ? 'bg-red-500' : 'bg-green-500'}`} />
                                                        <p className={`text-sm font-bold ${user.status === 'blocked' ? 'text-red-500' : 'text-green-500'}`}>{user.status}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Joined</p>
                                                    <p className="text-sm font-bold">{new Date(user.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-96 space-y-4 pt-6 lg:pt-0 lg:border-l lg:border-white/5 lg:pl-8">
                                            {user.role !== 'buyer' && (
                                                <div className="space-y-3">
                                                    <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Submitted Assets</h5>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {user.cnic_front && (
                                                            <a href={user.cnic_front} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-900 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-800 transition-colors">
                                                                <ExternalLink size={14} /> CNIC F
                                                            </a>
                                                        )}
                                                        {user.cnic_back && (
                                                            <a href={user.cnic_back} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-900 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-800 transition-colors">
                                                                <ExternalLink size={14} /> CNIC B
                                                            </a>
                                                        )}
                                                        {user.licenseDocument && (
                                                            <a href={user.licenseDocument} target="_blank" rel="noopener noreferrer" className="col-span-2 p-3 bg-slate-900 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-800 transition-colors">
                                                                <ShieldCheck size={14} className="text-primary" /> Professional License
                                                            </a>
                                                        )}
                                                    </div>
                                                    {user.agencyName && (
                                                        <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                                                            <p className="text-[10px] font-bold text-primary uppercase">Agency</p>
                                                            <p className="text-sm font-bold">{user.agencyName}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-3 pt-2">
                                                {user.verificationStatus === 'pending' && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            disabled={!!updatingId}
                                                            onClick={() => handleUpdateStatus(user._id, 'approved')}
                                                            className="flex-1 p-4 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                                                        >
                                                            {updatingId === user._id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                            Approve
                                                        </button>
                                                        <button
                                                            disabled={!!updatingId}
                                                            onClick={() => handleUpdateStatus(user._id, 'rejected')}
                                                            className="flex-1 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-black border border-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                        >
                                                            <XCircle size={18} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                <button
                                                    disabled={!!updatingId}
                                                    onClick={() => handleToggleBlock(user._id, user.status === 'blocked' ? 'active' : 'blocked')}
                                                    className={`w-full p-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border active:scale-95 ${user.status === 'blocked'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                                                        }`}
                                                >
                                                    {updatingId === user._id ? <Loader2 size={18} className="animate-spin" /> : (user.status === 'blocked' ? <UserCheck size={18} /> : <Ban size={18} />)}
                                                    {user.status === 'blocked' ? 'Unblock User' : 'Block ID / Complain'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    filteredMessages.length === 0 ? (
                        <div className="text-center p-24 glass rounded-[3rem] border-white/5">
                            <Mail className="mx-auto mb-4 text-slate-700" size={64} />
                            <h3 className="text-2xl font-bold mb-2">No Messages Found</h3>
                            <p className="text-slate-500">Your support queue is currently empty.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredMessages.map((msg) => (
                                <div key={msg._id} className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-primary font-bold border border-white/5">
                                                        {msg.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white">{msg.name}</h4>
                                                        <p className="text-slate-500 text-xs">{msg.email}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${msg.status === 'unread' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    msg.status === 'read' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                        'bg-green-500/10 text-green-500 border border-green-500/20'
                                                    }`}>
                                                    {msg.status}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <MessageSquare size={18} className="text-primary" />
                                                {msg.subject}
                                            </h3>
                                            <p className="text-slate-400 leading-relaxed bg-white/5 p-6 rounded-2xl italic">
                                                "{msg.message}"
                                            </p>
                                        </div>

                                        <div className="w-full lg:w-72 flex flex-col justify-between pt-6 lg:pt-0 lg:border-l lg:border-white/5 lg:pl-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={16} />
                                                    <span className="text-xs font-bold">{new Date(msg.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Status Lifecycle</p>
                                                    <select
                                                        value={msg.status}
                                                        disabled={updatingId === msg._id}
                                                        onChange={(e) => handleUpdateMessageStatus(msg._id, e.target.value)}
                                                        className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                                                    >
                                                        <option value="unread">Unread</option>
                                                        <option value="read">Read</option>
                                                        <option value="handled">Handled</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

const StatBox = ({ label, value, icon: Icon, color }: any) => (
    <div className="glass p-6 rounded-3xl border-white/5">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
        </div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value || 0}</p>
    </div>
);

export default AdminPanel;

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Mail, Phone, Calendar, Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Inquiry {
    _id: string;
    property: {
        _id: string;
        title: string;
        price: number | string;
        images: string[];
    };
    user: {
        name: string;
        email: string;
        phone: string;
    };
    type: 'contact' | 'booking';
    message: string;
    bookingDate?: string;
    status: 'pending' | 'contacted' | 'visited' | 'resolved' | 'cancelled';
    created_at: string;
}

const InquiryList: React.FC<{ role: 'seller' | 'broker' | 'buyer' }> = ({ role }) => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchInquiries = async () => {
        try {
            const res = await api.engagement.getInquiries({ role });
            if (res.success) {
                setInquiries(res.data);
            }
        } catch (err) {
            toast.error('Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [role]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await api.engagement.updateInquiryStatus(id, newStatus);
            if (res.success) {
                toast.success(`Inquiry marked as ${newStatus}`);
                setInquiries(prev => prev.map(inv => inv._id === id ? { ...inv, status: newStatus as any } : inv));
            }
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (inquiries.length === 0) return (
        <div className="text-center p-12 glass rounded-3xl border-white/5">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
                <Mail size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Inquiries Found</h3>
            <p className="text-slate-500">When potential leads contact you, they will appear here.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {inquiries.map((inquiry) => (
                <div key={inquiry._id} className="glass p-6 rounded-3xl border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Property Info */}
                        <div className="w-full lg:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                            <img
                                src={inquiry.property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'}
                                alt="property"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1">{inquiry.property.title}</h4>
                                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                        <Clock size={14} />
                                        <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                                        <span className="px-2 py-0.5 bg-primary/20 rounded uppercase text-[10px] tracking-widest">{inquiry.type}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inquiry.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                        inquiry.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            inquiry.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                                'bg-primary/20 text-primary'
                                        }`}>
                                        {inquiry.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Inquirer Details</p>
                                    <div className="space-y-2">
                                        <p className="font-bold text-white">{inquiry.user.name}</p>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Mail size={14} /> {inquiry.user.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Phone size={14} /> {inquiry.user.phone}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Message</p>
                                    <p className="text-slate-400 text-sm italic">"{inquiry.message || 'No message provided'}"</p>
                                    {inquiry.bookingDate && (
                                        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                            <Calendar className="text-primary" size={18} />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Requested Visit</p>
                                                <p className="text-white font-bold">{new Date(inquiry.bookingDate).toLocaleDateString()} at {new Date(inquiry.bookingDate).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(role === 'seller' || role === 'broker') && inquiry.status === 'pending' && (
                                <div className="mt-6 flex gap-3">
                                    <button
                                        disabled={!!updatingId}
                                        onClick={() => handleStatusUpdate(inquiry._id, 'contacted')}
                                        className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        Mark as Contacted
                                    </button>
                                    <button
                                        disabled={!!updatingId}
                                        onClick={() => handleStatusUpdate(inquiry._id, 'resolved')}
                                        className="px-6 py-3 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-xl font-bold text-sm border border-green-600/30 transition-all shadow-lg"
                                    >
                                        Resolved
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InquiryList;

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useChat } from '../contexts/ChatContext';
import { MessageSquare, Loader, User, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Conversation {
    userId: string;
    name: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    propertyId?: string;
}

const Messages: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const { openChat } = useChat();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await api.chat.getConversations();
                const rawData = res.conversations || [];

                const data = rawData.map((conv: any) => ({
                    userId: conv.user._id,
                    name: conv.user.name,
                    lastMessage: conv.lastMessage,
                    lastMessageTime: conv.timestamp,
                    unreadCount: 0,
                    propertyId: conv.propertyId
                }));

                console.log('Conversations with propertyId:', data);
                setConversations(data);
            } catch (err) {
                console.error('Failed to load conversations', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    if (loading) {
        return (
            <div className="pt-32 min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Loader className="animate-spin text-primary" size={48} />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-950 animate-fade-in">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-primary text-xs font-bold mb-6">
                        <MessageSquare size={14} className="fill-current" />
                        <span>Direct Messages</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Inbox</h1>
                    <p className="text-slate-400 text-lg">
                        Manage your communications with dealers and buyers.
                    </p>
                </header>

                {conversations.length === 0 ? (
                    <div className="glass p-16 rounded-[2.5rem] border-white/5 text-center animate-slide-up">
                        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5">
                            <MessageSquare size={40} className="text-slate-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">No messages yet</h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Connect with dealers on property listings to start a conversation.
                        </p>
                        <Link
                            to="/listings"
                            className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
                        >
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 animate-slide-up">
                        {conversations.map((conv, idx) => (
                            <div
                                key={idx}
                                onClick={() => openChat({
                                    userId: conv.userId,
                                    name: conv.name,
                                    propertyId: conv.propertyId
                                })}
                                className="glass p-6 rounded-2xl border-white/5 hover:bg-white/5 cursor-pointer transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center border border-white/10">
                                        <User className="text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                            {conv.name}
                                        </h3>
                                        <p className="text-slate-400 text-sm line-clamp-1">
                                            {conv.lastMessage || 'Start a conversation...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-slate-500">
                                    {conv.lastMessageTime && (
                                        <span className="text-xs font-medium flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(conv.lastMessageTime).toLocaleDateString()}
                                        </span>
                                    )}
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform text-white/20 group-hover:text-primary" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;

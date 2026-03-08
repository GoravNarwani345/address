import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, User, Loader, Bot } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPopup: React.FC = () => {
    const { socket, isOpen, setIsOpen, activeChat } = useChat();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // B10: Read user data reactively inside the component
    const currentUserId = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.id || user._id;
        } catch { return null; }
    }, [isOpen]);

    const userRole = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.role;
        } catch { return null; }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        let handleReceiveMessage: (msg: any) => void;

        if (isOpen && activeChat && currentUserId) {
            fetchHistory();
            if (socket) {
                socket.emit('join_room', {
                    senderId: currentUserId,
                    receiverId: activeChat.userId
                });

                handleReceiveMessage = (message: any) => {
                    setMessages((prev) => [...prev, message]);
                };

                socket.on('receive_message', handleReceiveMessage);
            }
        }
        return () => {
            if (socket && handleReceiveMessage) socket.off('receive_message', handleReceiveMessage);
        };
    }, [isOpen, activeChat, socket, currentUserId]);

    useEffect(scrollToBottom, [messages]);

    const fetchHistory = async () => {
        if (!activeChat) return;
        try {
            const res = await api.chat.getHistory(activeChat.userId);
            setMessages(res.messages || []);
        } catch (err) {
            console.error('Failed to fetch chat history', err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!activeChat) {
            console.error('No active chat');
            return;
        }

        // Use AI only if propertyId exists AND aiEnabled is true, OR if no propertyId but receiverId exists
        if (aiEnabled && (activeChat.propertyId || activeChat.userId)) {
            const userMsg = { senderId: currentUserId, content: newMessage, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setNewMessage('');
            setLoading(true);

            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const res = await api.post('/ai-broker/chat', {
                    propertyId: activeChat.propertyId,
                    receiverId: activeChat.userId,
                    message: newMessage,
                    userRole: user.role || 'buyer'
                });
                if (res.data.success) {
                    const aiMsg = { senderId: 'ai', content: res.data.response, timestamp: new Date() };
                    setMessages(prev => [...prev, aiMsg]);
                }
            } catch (err) {
                console.error('AI response failed:', err);
            } finally {
                setLoading(false);
            }
            return;
        }

        // Regular socket chat (user to user)
        if (!socket) {
            console.error('Socket not connected');
            return;
        }

        const messageData = {
            senderId: currentUserId,
            receiverId: activeChat.userId,
            propertyId: activeChat.propertyId,
            content: newMessage
        };
        
        socket.emit('send_message', messageData);
        setMessages(prev => [...prev, { senderId: currentUserId, content: newMessage, timestamp: new Date() }]);
        setNewMessage('');
    };

    if (!isOpen || !activeChat) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
                className="fixed bottom-6 right-6 w-full sm:w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-3rem)] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden glass"
            >
                {/* Header */}
                <div className="p-4 bg-indigo-600 flex justify-between items-center shadow-lg relative overflow-visible">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold leading-none">{activeChat.name || 'Property Owner'}</h3>
                            <span className="text-indigo-200 text-xs">Online</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {(userRole === 'broker' || userRole === 'seller') && (
                            <div className="relative group">
                                <button
                                    onClick={() => setAiEnabled(!aiEnabled)}
                                    className={`p-2 rounded-full transition-all ${
                                        aiEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                >
                                    <Bot size={20} className="text-white" />
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10 z-50">
                                    {aiEnabled ? 'AI Agent: ON' : 'AI Agent: OFF'}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {messages.map((msg, i) => {
                        const isMe = (msg.sender?._id || msg.senderId) === currentUserId;
                        const isAI = msg.senderId === 'ai';
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    isAI ? 'bg-green-600 text-white rounded-tl-none' :
                                    isMe ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                                <Loader className="animate-spin text-indigo-500" size={16} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-slate-800/50 border-t border-white/5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatPopup;

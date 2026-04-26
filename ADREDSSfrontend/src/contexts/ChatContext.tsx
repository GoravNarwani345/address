import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface ChatContextType {
    socket: Socket | null;
    connected: boolean;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    activeChat: { userId: string; name: string; propertyId?: string } | null;
    setActiveChat: (chat: { userId: string; name: string; propertyId?: string } | null) => void;
    openChat: (chat: { userId: string; name: string; propertyId?: string }) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState<{ userId: string; name: string; propertyId?: string } | null>(null);

    useEffect(() => {
        let currentSocket: Socket | null = null;

        const initializeSocket = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found, socket not initialized');
                if (currentSocket) {
                    currentSocket.disconnect();
                    setSocket(null);
                    setConnected(false);
                }
                setIsOpen(false);
                setActiveChat(null);
                return;
            }

            if (currentSocket) return; // Already connected

            console.log('Initializing socket connection...');
            const newSocket = io('http://localhost:5000', {
                auth: { token },
                transports: ['websocket', 'polling']
            });
            currentSocket = newSocket;

            newSocket.on('connect', () => {
                console.log('✓ Socket connected');
                setConnected(true);
                setSocket(newSocket);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setConnected(false);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setConnected(false);
                setSocket(null);
                currentSocket = null;
            });

            newSocket.on('receive_message', (message: any) => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const currentUserId = user.id || user._id;

                if (message.receiverId === currentUserId) {
                    toast.info(`New message from ${message.senderName || 'Contact'}: ${message.content}`, {
                        onClick: () => {
                            setActiveChat({
                                userId: message.senderId,
                                name: message.senderName || 'Contact',
                                propertyId: message.propertyId
                            });
                            setIsOpen(true);
                        },
                        icon: () => <span>💬</span>,
                        toastId: `msg-${message.senderId}`
                    });
                }
            });
        };

        const handleAuthChanged = () => {
            initializeSocket();
        };

        window.addEventListener('authChanged', handleAuthChanged);
        
        // Initial setup
        initializeSocket();

        return () => {
            window.removeEventListener('authChanged', handleAuthChanged);
            if (currentSocket) {
                console.log('Cleaning up socket connection');
                currentSocket.disconnect();
            }
        };
    }, []);

    const openChat = (chat: { userId: string; name: string; propertyId?: string }) => {
        setActiveChat(chat);
        setIsOpen(true);
    };

    return (
        <ChatContext.Provider value={{ socket, connected, isOpen, setIsOpen, activeChat, setActiveChat, openChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

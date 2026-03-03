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
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io('http://localhost:5000', {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            setConnected(false);
        });

        newSocket.on('receive_message', (message: any) => {
            // Get current active chat and open state from closures/refs if needed
            // But for simple notification, we check if the user is the receiver
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const currentUserId = user.id || user._id;

            if (message.receiverId === currentUserId) {
                // If popup is closed or chatting with someone else, show toast
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
                    toastId: `msg-${message.senderId}` // Avoid duplicate toasts from same user
                });
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
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

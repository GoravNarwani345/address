import React, { useState } from 'react';
import { Bot, Send, Loader2, X } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-toastify';

interface AIBrokerChatProps {
  propertyId: string;
  onClose: () => void;
}

const AIBrokerChat: React.FC<AIBrokerChatProps> = ({ propertyId, onClose }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: 'Hey! Ahmad here. I can help you with this property. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.post('/ai-broker/chat', {
        propertyId,
        message: userMessage,
        userRole: user.role || 'buyer'
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: response.data.response }]);
      }
    } catch (error: any) {
      toast.error('AI assistant unavailable');
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I\'m having trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">Ahmad - Property Broker</h3>
            <p className="text-xs text-slate-400">ADREDSS Real Estate</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-white/5 text-slate-200'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-3 rounded-2xl">
              <Loader2 className="animate-spin text-primary" size={20} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about price, viewing, etc..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-blue-600 text-white p-2 rounded-xl transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIBrokerChat;

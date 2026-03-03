import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, MapPin, Home, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const suggestions = [
    "Modern apartments in Qasimabad Hyderabad",
    "Luxury villas in Latifabad under 50M",
    "3 bedroom houses in Gulistan-e-Sajjad with parking",
    "Commercial plots near Saddar area Hyderabad",
    "Renovated flats in Citizen Colony with 24/7 water"
];

const AISearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        window.location.href = `/listings?search=${encodeURIComponent(query)}`;
    };

    return (
        <>
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(true)}
                className="glass w-full max-w-2xl mx-auto p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all group shadow-2xl"
            >
                <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/40 transition-colors">
                    <Sparkles className="text-primary w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-slate-400 text-sm">AI-Powered Search</p>
                    <p className="text-white font-medium">Ask ADREDSS anything... <span className="text-slate-500 text-xs ml-2 hidden sm:inline">(Ctrl+K)</span></p>
                </div>
                <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5 text-sm font-bold text-slate-400">
                    GO
                </div>
            </div>

            {/* Modal Overlay Portalled to Body */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
                            />

                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: -20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: -20 }}
                                className="relative w-full max-w-2xl glass-hover bg-slate-900/90 rounded-3xl border border-white/10 shadow-[0_0_50px_-12px_rgba(37,99,235,0.25)] overflow-hidden pointer-events-auto"
                            >
                                <form onSubmit={handleSearch} className="p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-primary/20 p-3 rounded-2xl">
                                            <Sparkles className="text-primary w-8 h-8 animate-pulse" />
                                        </div>
                                        <input
                                            ref={inputRef}
                                            value={query}
                                            onChange={(e) => {
                                                setQuery(e.target.value);
                                            }}
                                            placeholder="Describe your dream property..."
                                            className="flex-1 bg-transparent text-2xl font-bold text-white placeholder-slate-600 focus:outline-none"
                                        />
                                        <button type="button" onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Suggestions</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {suggestions.map((s, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                                                    className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5 group"
                                                >
                                                    <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                        <Home size={18} className="text-slate-500 group-hover:text-primary" />
                                                    </div>
                                                    <span className="text-slate-300 group-hover:text-white transition-colors">{s}</span>
                                                    <ArrowRight size={16} className="ml-auto text-slate-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {query && (
                                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <MapPin size={14} />
                                                <span>Searching nationwide database</span>
                                            </div>
                                            <button type="submit" className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                                                Search with AI
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default AISearch;

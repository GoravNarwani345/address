import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { PropertyData } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { Loader, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<PropertyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                const response = await api.engagement.getFavorites();
                // Ensure we get an array of properties
                const favData = response.data || response || [];
                setFavorites(Array.isArray(favData) ? favData : []);
            } catch (err) {
                console.error('Error fetching favorites:', err);
                setError('Failed to load favorites. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <div className="pt-32 min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Loader className="animate-spin text-primary" size={48} />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Loading your favorites...</p>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-950 animate-fade-in">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-primary text-xs font-bold mb-6">
                        <Heart size={14} className="fill-current" />
                        <span>Curated Collection</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4">Your Favorites</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Keep track of the properties that caught your eye. Ready to take the next step?
                    </p>
                </header>

                {error ? (
                    <div className="glass p-12 rounded-[2.5rem] border-red-500/20 text-center">
                        <p className="text-red-400 font-bold mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-primary font-black hover:underline underline-offset-8"
                        >
                            Try Refreshing
                        </button>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="glass p-20 rounded-[3rem] border-white/5 text-center animate-slide-up">
                        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5">
                            <Heart size={40} className="text-slate-700" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">No favorites yet</h2>
                        <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto line-height-relaxed">
                            Start exploring the finest properties in Hyderabad and save the ones you love most.
                        </p>
                        <Link
                            to="/listings"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-3xl group"
                        >
                            Explore Listings
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-slide-up">
                        {favorites.map((property, idx) => (
                            <div key={property.id || idx} className="transition-all duration-700">
                                <PropertyCard
                                    {...property}
                                    id={property.id || (property as any)._id}
                                    price={typeof property.price === 'number' ? `PKR ${property.price.toLocaleString()}` : property.price}
                                    image={property.images?.[0] || property.image || `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80`}
                                    location={property.address || property.location || 'Location not available'}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;

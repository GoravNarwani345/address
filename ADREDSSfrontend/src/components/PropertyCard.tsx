import React, { useState, useEffect } from 'react';
import { MapPin, Heart, Bed, Bath, Square, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';

interface PropertyCardProps {
  id: number | string;
  title: string;
  price: string;
  image?: string;
  images?: string[];
  location: string;
  viewMode?: 'grid' | 'list';
  priceRating?: 'good_deal' | 'fair' | 'overpriced';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  createdBy?: {
    name: string;
    isVerifiedBroker: boolean;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ id, title, price, image, images = [], location, viewMode = 'grid', priceRating, bedrooms, bathrooms, area, createdBy }) => {
  const isList = viewMode === 'list';
  const isVerified = createdBy?.isVerifiedBroker || false;
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const displayImages = images.length > 0 ? images : [image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'];

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  useEffect(() => {
    const checkFavorite = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const favs = await api.engagement.getFavorites();
        const isFav = favs.data?.some((f: any) => (f.id || f._id) === id);
        setIsFavorited(!!isFav);
      } catch (e: any) {
        if (e.response?.status === 401) {
          // Interceptor handles the cleanup, we just stop here
          return;
        }
        console.error('Error checking favorite status:', e);
      }
    };
    checkFavorite();
  }, [id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!localStorage.getItem('token')) {
      toast.info('Please sign in to add to favorites');
      return;
    }

    try {
      await api.engagement.toggleFavorite(id);
      setIsFavorited(!isFavorited);
      toast.success(!isFavorited ? 'Added to favorites' : 'Removed from favorites', { autoClose: 1500 });
    } catch (err) {
      toast.error('Error updating favorites');
    }
  };

  return (
    <Link to={`/listing/${id}`} className="block group">
      <div className={`glass rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border border-white/5 hover:border-primary/30 flex ${isList ? 'flex-row h-72' : 'flex-col h-full'}`}>
        {/* Image Container */}
        <div className={`relative bg-slate-800 overflow-hidden group/card ${isList ? 'w-2/5' : 'h-52'}`}>
          <img
            src={displayImages[currentImgIndex]}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const uniqueFallback = `https://picsum.photos/seed/prop-${id}-${currentImgIndex}/800/600`;
              if (target.src !== uniqueFallback) {
                target.src = uniqueFallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-slate-950/20 group-hover/card:bg-slate-950/0 transition-colors" />

          {/* Slider Controls */}
          {displayImages.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <button
                onClick={prevImg}
                className="p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-primary border border-white/10 backdrop-blur-sm transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button
                onClick={nextImg}
                className="p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-primary border border-white/10 backdrop-blur-sm transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          )}

          {/* Slider Indicators */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {displayImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${idx === currentImgIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          )}

          <button
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 backdrop-blur-sm z-10 border ${isFavorited ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950/60 hover:bg-slate-900 border-white/10 text-white'}`}
            onClick={toggleFavorite}
          >
            <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
          </button>

          {isVerified && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 text-white text-[10px] font-bold rounded shadow-lg backdrop-blur-sm flex items-center gap-1 z-10 border border-white/20">
              <CheckCircle size={12} className="text-white fill-primary" />
              VERIFIED BROKER
            </div>
          )}

          <div className="absolute bottom-3 left-3 px-2 py-1 bg-secondary text-white text-[10px] font-bold rounded-md z-10 shadow-lg">
            PREMIUM
          </div>

          {priceRating === 'good_deal' && (
            <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-green-500 text-white text-[11px] font-black rounded-lg z-10 shadow-xl border border-green-400 animate-pulse-slow">
              🔥 GOOD DEAL
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className={`p-5 flex-1 flex flex-col ${isList ? 'justify-center' : ''}`}>
          <div className="mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
            <div className="flex items-center gap-1 text-slate-400 mt-1">
              <MapPin size={16} className="shrink-0 text-primary" />
              <p className="text-sm line-clamp-1">{location}</p>
            </div>
          </div>

          {!isList && (
            <div className="flex items-center gap-4 text-slate-400 text-sm my-4 py-3 border-y border-white/5">
              <div className="flex items-center gap-1.5">
                <Bed size={16} className="text-primary" />
                <span>{bedrooms || '3'} Bed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath size={16} className="text-primary" />
                <span>{bathrooms || '2'} Bath</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Square size={14} className="text-primary" />
                <span>{area || '1,200'} sqft</span>
              </div>
            </div>
          )}

          {isList && (
            <p className="text-slate-400 text-sm line-clamp-3 my-4 hidden md:block leading-relaxed">
              Experience luxury living at its finest with ADREDSS. This premium property features modern amenities,
              spacious interiors, and a prime location, all verified for quality and security.
            </p>
          )}

          <div className="mt-auto flex justify-between items-center pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Starting From</span>
              <span className="text-2xl font-black text-primary">{price}</span>
            </div>
            <span className="px-5 py-2.5 bg-primary group-hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-300 text-sm shadow-xl shadow-primary/20 border border-white/10">
              Explore Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;

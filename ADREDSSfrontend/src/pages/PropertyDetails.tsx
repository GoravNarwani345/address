import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { MapPin, Heart, Share2, Bed, Bath, Square, Loader, Edit2, Trash2, Calendar, MessageSquare, X, Cpu } from 'lucide-react';
import { api } from '../services/api';
import type { PropertyData } from '../services/api';
import { toast } from 'react-toastify';
import { useChat } from '../contexts/ChatContext';
import PropertyMap from '../components/PropertyMap';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<PropertyData[]>([]);
  const [aiInsight, setAiInsight] = useState<{ insight: string; analysis: any } | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Engagement State
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { openChat } = useChat();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let currentUser: any = null;
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
        setUserRole(currentUser.role);
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }

    const fetchPropertyData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPropertyById(id);
        if (!data || (!data.title && !data.price)) {
          throw new Error('Invalid property data received');
        }
        setProperty(data);

        // Fetch AI Insight
        setInsightLoading(true);
        api.getPropertyInsight(data)
          .then(setAiInsight)
          .catch(e => console.error("Failed to fetch AI insight:", e))
          .finally(() => setInsightLoading(false));

        // Fetch AI recommendations based on this property
        const recs = await api.getRecommendations(id);
        setRecommendations(recs);

        // Check if favorite
        if (currentUser) {
          try {
            const favs = await api.engagement.getFavorites();
            const isFav = favs.data?.some((f: any) => (f.id || f._id) === id);
            setIsFavorite(!!isFav);
          } catch (favErr: any) {
            if (favErr.response?.status === 401) return;
            console.error('Failed to fetch favorites:', favErr);
          }
        }
      } catch (err: any) {
        if (err.response?.status === 401) return;
        const errMsg = 'Property not found or data is invalid.';
        setError(errMsg);
        toast.error(errMsg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    if (!localStorage.getItem('token')) {
      toast.info('Please sign in to add to favorites');
      return;
    }
    try {
      await api.engagement.toggleFavorite(id);
      setIsFavorite(!isFavorite);
      toast.success(!isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      toast.error('Failed to update favorites');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!bookingDate) {
      toast.warning('Please select a date for your visit');
      return;
    }
    setSubmitting(true);
    try {
      await api.engagement.createInquiry({
        propertyId: id,
        type: 'booking',
        bookingDate,
        message: bookingMessage
      });
      toast.success('Your visit request has been submitted!');
      setShowBookingModal(false);
      setBookingDate('');
      setBookingMessage('');
    } catch (err) {
      toast.error('Failed to book visit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await api.deleteProperty(id);
      toast.success('Listing deleted successfully');
      navigate('/my-listings');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to delete listing';
      toast.error(errMsg);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-500" size={48} />
          <div className="text-white text-xl">Loading property details...</div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || 'Property not found.'}</div>
      </div>
    );
  }

  const formatPrice = (price: any) => {
    if (typeof price === 'number') return `PKR ${price.toLocaleString()}`;
    if (!price) return 'Price on Request';
    return price;
  };

  const displayPrice = formatPrice(property.price);
  const displayImage = property.images?.[0] || property.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Photos/Gallery */}
          <div className="space-y-4">
            <div className="aspect-4/3 rounded-4xl overflow-hidden shadow-2xl bg-gray-800 border border-white/5 relative group">
              <img
                src={property.images?.[activeImageIndex] || displayImage}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const uniqueFb = `https://picsum.photos/seed/detail-${id}-${activeImageIndex}/1200/800`;
                  if (target.src !== uniqueFb) target.src = uniqueFb;
                }}
              />

              {/* Main Image Navigation */}
              {property.images && property.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length)}
                    className="p-3 rounded-full bg-slate-900/60 text-white hover:bg-primary border border-white/10 backdrop-blur-sm transition-all"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % property.images!.length)}
                    className="p-3 rounded-full bg-slate-900/60 text-white hover:bg-primary border border-white/10 backdrop-blur-sm transition-all"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative shrink-0 w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const uniqueFb = `https://picsum.photos/seed/thumb-${id}-${idx}/200/200`;
                        if (target.src !== uniqueFb) target.src = uniqueFb;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-white space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">{property.title || 'Property Details'}</h1>
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-medium">{property.address || property.location || 'Address not available'}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard!'); }} className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 border border-white/5 transition-all" title="Share"><Share2 size={24} /></button>
                <button onClick={handleToggleFavorite} className={`p-3 rounded-full border transition-all ${isFavorite ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-gray-800 border-white/5 text-gray-400'}`} title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
                  <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            <div className="text-4xl font-black text-primary tracking-tighter">{displayPrice}</div>

            <div className="grid grid-cols-3 gap-6 py-8 border-y border-white/5 text-center">
              <div><Bed className="w-6 h-6 text-primary mx-auto mb-2" /><p className="text-xs text-gray-400 uppercase font-bold mb-1">Beds</p><p className="text-lg font-black">{property.bedrooms ?? 'N/A'}</p></div>
              <div><Bath className="w-6 h-6 text-primary mx-auto mb-2" /><p className="text-xs text-gray-400 uppercase font-bold mb-1">Baths</p><p className="text-lg font-black">{property.bathrooms ?? 'N/A'}</p></div>
              <div><Square className="w-6 h-6 text-primary mx-auto mb-2" /><p className="text-xs text-gray-400 uppercase font-bold mb-1">Area</p><p className="text-lg font-black">{property.area || 'N/A'}</p></div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-400 leading-relaxed text-lg font-medium">
                {property.description || 'No description provided for this property.'}
              </p>
            </div>

            {/* AI Insight */}
            {(aiInsight || insightLoading) && (
              <div className="relative group p-[2px] rounded-4xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-r from-primary/30 to-purple-500/30 animate-pulse" />
                <div className="relative bg-slate-900/95 backdrop-blur-2xl p-8 rounded-[2.4rem] border border-white/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-4xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">AI Valuation Insight</h3>
                      <p className="text-[10px] text-primary font-bold tracking-widest uppercase">Smart Market Analysis</p>
                    </div>
                  </div>
                  {insightLoading ? (
                    <div className="animate-pulse text-slate-500 font-bold">Calculating area data...</div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg text-slate-200 italic font-medium">"{aiInsight?.insight}"</p>
                      {aiInsight?.analysis && (
                        <div className="flex gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${aiInsight.analysis.rating === 'good_deal' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            aiInsight.analysis.rating === 'overpriced' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                            {aiInsight.analysis.rating.replace('_', ' ')}
                          </span>
                          <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] text-slate-400 font-bold border border-white/10">
                            {Math.abs(aiInsight.analysis.difference)}% {aiInsight.analysis.difference < 0 ? 'Below' : 'Above'} Market
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {(userRole === 'seller' || userRole === 'broker') ? (
                <>
                  <RouterLink to={`/edit-listing/${id}`} className="flex-1 flex items-center justify-center gap-2 p-4 bg-gray-800 rounded-2xl font-black border border-white/5 hover:bg-gray-700 transition-all shadow-xl"><Edit2 size={20} /> Edit</RouterLink>
                  <button onClick={handleDelete} className="flex-1 p-4 bg-red-900/20 text-red-500 rounded-2xl font-black border border-red-500/20 hover:bg-red-900/40 transition-all"><Trash2 size={20} /> Delete</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      const userStr = localStorage.getItem('user');
                      if (!userStr) {
                        toast.error('Please log in to contact the dealer.');
                        return;
                      }

                      let dealerId = null;
                      let dealerName = 'Property Dealer';

                      if (typeof property.createdBy === 'string') {
                        dealerId = property.createdBy;
                      } else if (property.createdBy) {
                        dealerId = (property.createdBy as any)._id || (property.createdBy as any).id;
                        dealerName = (property.createdBy as any).name || dealerName;
                      }

                      if (dealerId) {
                        openChat({ userId: dealerId as string, name: dealerName, propertyId: id as string });
                      } else {
                        toast.error('Dealer information is currently unavailable.');
                      }
                    }}
                    className="flex-1 p-5 bg-primary hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={22} /> Contact Dealer
                  </button>
                  <button onClick={() => setShowBookingModal(true)} className="flex-1 p-5 bg-gray-800 hover:bg-gray-700 text-white font-black rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2">
                    <Calendar size={22} /> Book Visit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-24 space-y-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-4"><MapPin className="text-primary" /> Property Location</h2>
          <div className="rounded-4xl overflow-hidden border border-white/5 shadow-2xl h-[400px]">
            <PropertyMap properties={[property]} height="100%" zoom={15} />
          </div>
        </div>

        {/* AI Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">AI</span>
              Recommended Similar Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/listing/${rec.id}`)}
                  className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-indigo-500 transition-all"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={rec.images?.[0] || rec.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const uniqueFb = `https://picsum.photos/seed/rec-${rec.id}/800/600`;
                        if (target.src !== uniqueFb) target.src = uniqueFb;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{rec.title}</h3>
                    <p className="text-indigo-400 font-bold">{formatPrice(rec.price)}</p>
                    <div className="flex items-center gap-4 mt-4 text-gray-500 text-sm">
                      <span className="flex items-center gap-1"><Bed size={14} /> {rec.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath size={14} /> {rec.bathrooms}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Visit Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 relative shadow-3xl">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors">
              <X size={28} />
            </button>
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Calendar className="text-primary" />
              Book Visit
            </h2>
            <p className="text-slate-400 mb-8 font-medium">Schedule a physical viewing of the property.</p>
            <form onSubmit={handleBookingSubmit} className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Date</label>
                <input
                  type="date"
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-primary transition-all outline-hidden"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-primary hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {submitting ? <Loader className="animate-spin" /> : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;

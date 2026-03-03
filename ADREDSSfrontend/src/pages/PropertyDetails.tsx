import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { MapPin, Heart, Share2, Bed, Bath, Square, Loader, Edit2, Trash2, Calendar, MessageSquare, X } from 'lucide-react';
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

  // Engagement State
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
          {/* Left Column - Images */}
          <div className="space-y-6">
            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
              <img
                src={displayImage}
                alt={property.title || 'Property'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="text-white space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-4">{property.title || 'Property Details'}</h1>
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-5 h-5 mr-2 text-indigo-500 shrink-0" />
                  <span>{property.address || property.location || 'Address not available'}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors" title="Share text-indigo-400">
                  <Share2 className="w-6 h-6" />
                </button>
                <button
                  className={`p-3 rounded-full transition-all duration-300 ${isFavorite ? 'bg-red-500/20 text-red-500 border-red-500/50 border' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  onClick={handleToggleFavorite}
                  title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <div className="text-3xl font-bold text-indigo-400">
              {displayPrice}
            </div>

            <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-800 text-center">
              <div className="flex flex-col items-center">
                <Bed className="w-6 h-6 text-indigo-500 mb-2" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Bedrooms</span>
                <span className="font-semibold text-lg">{property.bedrooms ?? 'N/A'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Bath className="w-6 h-6 text-indigo-500 mb-2" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Bathrooms</span>
                <span className="font-semibold text-lg">{property.bathrooms ?? 'N/A'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Square className="w-6 h-6 text-indigo-500 mb-2" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Area</span>
                <span className="font-semibold text-lg">{property.area || 'N/A'}</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                {property.description || 'No description provided for this property.'}
              </p>
            </div>

            {/* Property Location Map */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MapPin className="text-primary" />
                Property Location
              </h2>
              <PropertyMap properties={[property]} height="300px" zoom={15} />
            </div>

            {(userRole === 'seller' || userRole === 'broker') ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <RouterLink
                  to={`/edit-listing/${property.id}`}
                  className="flex items-center justify-center gap-2 p-4 bg-gray-800 text-white rounded-2xl font-black border border-gray-700 hover:bg-gray-700 transition-all shadow-xl"
                >
                  <Edit2 size={20} />
                  Edit Listing
                </RouterLink>
                <button
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 border border-red-900/50"
                >
                  <Trash2 size={20} />
                  Delete Listing
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    if (property.createdBy) {
                      openChat({
                        userId: (property.createdBy as any)._id || (property.createdBy as any).id,
                        name: (property.createdBy as any).name,
                        propertyId: property.id as string
                      });
                    }
                  }}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={20} />
                  Contact Dealer
                </button>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 border border-gray-700 flex items-center justify-center gap-2"
                >
                  <Calendar size={20} />
                  Book a Visit
                </button>
              </div>
            )}
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
                      src={rec.images?.[0] || rec.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 relative shadow-2xl">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="text-indigo-500" />
              Book a Visit
            </h2>
            <p className="text-gray-400 mb-6 font-medium">Schedule a physical visit to see the property in person.</p>
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Select Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all scheme-dark"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Additional Note (Optional)</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  rows={3}
                  placeholder="Tell the dealer about your preferred time or specific requirements."
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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

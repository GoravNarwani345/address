import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { PropertyData } from '../services/api';
import { toast } from 'react-toastify';

const MyListing: React.FC = () => {
  const [userListings, setUserListings] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProperties();
      // B04: Filter to only show the current user's listings
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userId = user.id || user._id;
        const filtered = data.filter((p: any) => {
          const creatorId = typeof p.createdBy === 'object'
            ? (p.createdBy?._id || p.createdBy?.id)
            : p.createdBy;
          return creatorId === userId;
        });
        setUserListings(filtered);
      } else {
        setUserListings(data);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load listings';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user.role || user.type;
        if (role !== 'seller' && role !== 'broker') {
          navigate('/');
          return;
        }
      } catch (e) {
        navigate('/auth');
        return;
      }
    } else {
      navigate('/auth');
      return;
    }
    fetchListings();
  }, [navigate]);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteProperty(id);
      setUserListings(prev => prev.filter(l => l.id !== id));
      toast.success('Listing deleted successfully');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to delete listing';
      toast.error(errMsg);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your listings...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">My Listings</h1>
          <Link
            to="/add-listing"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
          >
            <Plus size={20} />
            Add New
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {!Array.isArray(userListings) || userListings.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-3xl border border-gray-700">
            <p className="text-gray-400 text-xl mb-6">You haven't added any listings yet.</p>
            <Link
              to="/add-listing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition shadow-xl"
            >
              <Plus size={24} />
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userListings.map((listing, index) => (
              <div key={listing.id || index} className="bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 shadow-xl group hover:border-blue-500 transition-all duration-300">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={listing.images?.[0] || listing.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    {listing.propertyType}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{listing.title}</h3>
                  <p className="text-blue-400 font-bold text-lg mb-4">PKR {listing.price.toLocaleString()}</p>

                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <Link
                      to={`/edit-listing/${listing.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
                    >
                      <Edit2 size={18} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id!)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl transition border border-red-900/50"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListing;

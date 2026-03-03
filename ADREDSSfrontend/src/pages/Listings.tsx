import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { api } from '../services/api';
import type { PropertyData } from '../services/api';
import { toast } from 'react-toastify';
import { Loader, Grid, List as ListIcon, SlidersHorizontal, Map as MapIcon } from 'lucide-react';
import PropertyMap from '../components/PropertyMap';

const Listings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const type = searchParams.get('type') || undefined;
        const category = searchParams.get('category') || undefined;
        const location = searchParams.get('location') || undefined;
        const searchQuery = searchParams.get('search') || undefined;

        let result: PropertyData[] = [];

        if (searchQuery) {
          // Use the AI Natural Language Search endpoint
          const aiData = await api.aiSearch(searchQuery);
          result = aiData.properties || [];
          toast.info(`AI parsed your search: ${searchQuery}`, { autoClose: 2000 });
        } else {
          // Standard filtering
          const data = await api.getProperties({ type, category, location });
          result = Array.isArray(data) ? [...data] : [];
        }

        // Simple client-side sorting for demonstration
        if (sortBy === 'price-asc') {
          result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        } else if (sortBy === 'price-desc') {
          result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        }

        setProperties(result);
      } catch (err) {
        const errMsg = 'Failed to load properties. Please try again later.';
        setError(errMsg);
        toast.error(errMsg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, sortBy]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-500" size={48} />
          <div className="text-white text-xl">Loading properties...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Property Listings</h1>
            <p className="text-gray-400">Discover your next luxury home in our curated selection.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode Toggles */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                title="List View"
              >
                <ListIcon size={20} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                title="Map View"
              >
                <MapIcon size={20} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <SlidersHorizontal size={18} className="text-blue-400" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-transparent text-white focus:outline-none cursor-pointer text-sm font-medium"
              >
                <option value="newest" className="bg-gray-800">Newest First</option>
                <option value="price-asc" className="bg-gray-800">Price: Low to High</option>
                <option value="price-desc" className="bg-gray-800">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {!Array.isArray(properties) || properties.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search criteria.</p>
            <button
              onClick={() => setSearchParams({})}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          viewMode === 'map' ? (
            <div className="animate-fade-in mb-20 bg-slate-900/50 p-2 rounded-3xl border border-white/5">
              <PropertyMap properties={properties} height="700px" />
            </div>
          ) : (
            <div className={`grid gap-8 mb-20 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id || (property as any)._id}
                  id={property.id || (property as any)._id}
                  title={property.title}
                  price={typeof property.price === 'number' ? `PKR ${property.price.toLocaleString()}` : property.price}
                  image={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                  location={property.address || 'Location not available'}
                  viewMode={viewMode as 'grid' | 'list'}
                  createdBy={property.createdBy}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Listings;

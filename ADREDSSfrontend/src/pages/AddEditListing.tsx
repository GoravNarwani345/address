import React, { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle, Info, X as CloseIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { PropertyData } from '../services/api';
import { toast } from 'react-toastify';

const AddEditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState<PropertyData>({
    title: '',
    description: '',
    price: '',
    address: '',
    propertyType: 'house',
    category: 'sell',
    bedrooms: 0,
    bathrooms: 0,
    area: '',
    images: [],
    status: 'available'
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifFile, setVerifFile] = useState<File | null>(null);
  const [verifType, setVerifType] = useState<string>('Deed');
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit && id) {
      const fetchProperty = async () => {
        setFetching(true);
        try {
          const data = await api.getPropertyById(id);
          setFormData({
            ...data,
            price: data.price.toString(),
          });
        } catch (err) {
          toast.error('Failed to fetch property details');
          setError('Failed to fetch property details');
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.price || !formData.address.trim()) {
      toast.error('Title, price, and address are required');
      setError('Title, price, and address are required');
      return;
    }

    setLoading(true);
    try {
      let propertyId = id;
      if (isEdit && id) {
        await api.updateProperty(id, formData);
        toast.success('Listing updated successfully!');
      } else {
        const result = await api.addProperty(formData);
        propertyId = result.property?._id || result.property?.id || result.id || result._id;
        toast.success('Listing published successfully!');
      }

      // Handle Property Verification Document Upload
      if (verifFile && propertyId) {
        const verifFormData = new FormData();
        verifFormData.append('verificationDoc', verifFile);
        verifFormData.append('documentType', verifType);
        await api.verification.submitPropertyDocument(propertyId.toString(), verifFormData);
        toast.info('Ownership document submitted for review');
      }

      setTimeout(() => navigate('/my-listings'), 1500);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred while saving';
      toast.error(errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), data],
        image: data // For backward compatibility
      }));
    };
    reader.readAsDataURL(file);
  };

  if (fetching) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading listing data...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">
          {isEdit ? 'Edit Listing' : 'Add New Listing'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
          {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-xl text-red-200">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-xl text-green-200">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-medium mb-2">Property Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Modern House in DHA"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                placeholder="Luxurious 500 sq yard house with modern amenities..."
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Price (PKR)</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="50000000"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Enter your address"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Property Type</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="house">House</option>
                <option value="flat">Flat</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="sell">Sell</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Area (e.g., 500 sq yard)</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="500 sq yard"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status || 'available'}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-gray-400 text-sm font-medium mb-2">Property Images</label>
            <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-indigo-500 transition group bg-gray-900/50">
              <Upload className="mx-auto mb-4 text-gray-500 group-hover:text-indigo-400 transition" size={48} />
              <p className="text-gray-400 mb-4">Click or drag images to upload</p>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="px-6 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition">
                Choose File
              </label>

              {(formData.images?.length || 0) > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-8">
                  {formData.images?.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                      <img src={img} alt={`preview-${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, images: p.images?.filter((_, i) => i !== index) }))}
                        className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 border-t border-gray-700 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-indigo-400" size={24} />
              <div>
                <h3 className="text-xl font-bold text-white">Ownership Verification</h3>
                <p className="text-gray-400 text-xs">Verify your property for a "Verified" badge and 2x more leads.</p>
              </div>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Document Type</label>
                  <select
                    value={verifType}
                    onChange={(e) => setVerifType(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none"
                  >
                    <option value="Deed">Sale Deed</option>
                    <option value="Allotment Letter">Allotment Letter</option>
                    <option value="NOC">NOC</option>
                    <option value="Tax Receipt">Tax Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Upload Document (Image/PDF)</label>
                  <div
                    onClick={() => document.getElementById('verif-doc')?.click()}
                    className="w-full px-4 py-2 bg-gray-800 border border-dashed border-gray-600 rounded-xl text-gray-400 text-sm cursor-pointer hover:border-indigo-500 transition-all flex items-center gap-3"
                  >
                    <FileText size={16} />
                    <span className="truncate">{verifFile ? verifFile.name : 'Choose File'}</span>
                    <input
                      type="file" id="verif-doc" className="hidden"
                      onChange={(e) => setVerifFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-gray-500 italic">
                <Info size={12} className="mt-0.5 shrink-0" />
                <p>Wait-times for manual verification range from 12-48 hours. Ensure the document clearly shows your name and property address.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-60 disabled:transform-none"
          >
            {loading ? 'Saving Changes...' : isEdit ? 'Update Listing' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEditListing;

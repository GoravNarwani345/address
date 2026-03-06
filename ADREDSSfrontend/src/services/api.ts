import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const instance = axios.create({
    baseURL: API_URL,
});

// Automatically add the Auth token to every request
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Centralized error handling for 401s
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 404) {
            console.error('Session invalid or user not found. Clearing credentials.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Avoid infinite reloads if already on home or signin/up
            const { pathname } = window.location;
            if (pathname !== '/' && !pathname.includes('signin') && !pathname.includes('signup')) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export interface PropertyData {
    id?: number | string;
    title: string;
    description: string;
    price: number | string;
    address: string;
    propertyType: string;
    category: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    images: string[];
    coordinates?: {
        lat: number;
        lng: number;
    };
    status: 'available' | 'sold' | 'rented';
    location?: string;
    image?: string;
    priceRating?: 'good_deal' | 'fair' | 'overpriced';
    isVerifiedListing?: boolean;
    createdBy?: {
        _id: string;
        name: string;
        role: string;
        isVerifiedBroker: boolean;
        verificationLevel?: 'none' | 'identity' | 'professional';
    };
}

export interface UserData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'buyer' | 'seller' | 'broker' | 'admin';
    avatar?: string;
    verified: boolean;
    isVerifiedBroker: boolean;
    verificationStatus: 'unverified' | 'pending' | 'approved' | 'rejected';
    verificationLevel: 'none' | 'identity' | 'professional';
    status: 'active' | 'blocked';
    agencyName?: string;
    licenseNumber?: string;
    licenseDocument?: string;
    fbrRegistrationNumber?: string;
    agencyAddress?: string;
    agencyPhone?: string;
    created_at: string;
    notificationSettings: {
        email: boolean;
        push: boolean;
        chat: boolean;
    };
}

const mockProperties: PropertyData[] = [
    {
        id: 'm1',
        title: 'Modern Apartment in DHA',
        price: 25000000,
        address: 'DHA Phase 6, Karachi',
        description: 'Contemporary apartment with modern amenities, close to shopping centers and restaurants.',
        propertyType: 'apartment',
        category: 'sell',
        bedrooms: 2,
        bathrooms: 2,
        area: 1000,
        images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200'],
        coordinates: { lat: 24.8138, lng: 67.0671 },
        status: 'available',
        createdBy: { _id: 'u1', name: 'Smart Broker', role: 'broker', isVerifiedBroker: true, verificationLevel: 'professional' }
    },
    {
        id: 'm2',
        title: 'Luxury Villa in Bahria',
        price: 55000000,
        address: 'Bahria Town, Lahore',
        description: 'Spacious villa with swimming pool, garden, and premium finishes in a secure neighborhood.',
        propertyType: 'house',
        category: 'sell',
        bedrooms: 4,
        bathrooms: 4,
        area: 500,
        images: ['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1200'],
        coordinates: { lat: 31.3651, lng: 74.1803 },
        status: 'available',
        createdBy: { _id: 'u2', name: 'Legacy Agent', role: 'seller', isVerifiedBroker: false, verificationLevel: 'identity' }
    }
];

export const api = {
    // Health
    async getHealth() {
        try {
            const response = await axios.get(`${BASE_URL}/health`);
            return response.data;
        } catch (e) {
            return { status: 'offline' };
        }
    },

    // Auth
    auth: {
        async signUp(formData: FormData) {
            const response = await instance.post('/signup', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        async signIn(data: any) {
            const response = await instance.post('/signin', data);
            return response.data;
        },
        async sendOtp(data: { email: string; purpose: 'verify' | 'reset' }) {
            const response = await instance.post('/send-otp', data);
            return response.data;
        },
        async verifyOtp(data: { email: string; otp: string }) {
            const response = await instance.post('/verify-otp', data);
            return response.data;
        },
        async forgotPassword(data: { email: string }) {
            const response = await instance.post('/forgot-password', data);
            return response.data;
        },
        async resetPassword(data: any) {
            const response = await instance.post('/reset-password', data);
            return response.data;
        },
        async resendVerification(data: { email: string }) {
            const response = await instance.post('/resend-verification', data);
            return response.data;
        },
        async getUser() {
            const response = await instance.get('/user');
            return response.data;
        },
        async updateSettings(data: { email?: boolean; push?: boolean; chat?: boolean }) {
            const response = await instance.put('/settings', data);
            return response.data;
        },
        async updateProfile(formData: FormData) {
            const response = await instance.put('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        async changePassword(data: any) {
            const response = await instance.put('/change-password', data);
            return response.data;
        },
    },

    // Admin Features
    admin: {
        async getUsers() {
            const response = await instance.get('/admin/users');
            return response.data;
        },
        async getPendingVerifications() {
            const response = await instance.get('/admin/verifications/pending');
            return response.data;
        },
        async updateVerificationStatus(data: { userId: string, status: string }) {
            const response = await instance.put('/admin/verifications/status', data);
            return response.data;
        },
        async toggleUserBlock(data: { userId: string, status: 'active' | 'blocked' }) {
            const response = await instance.patch('/admin/users/toggle-block', data);
            return response.data;
        },
        async getAllPendingListingVerifications() {
            const response = await instance.get('/admin/verifications/listings/pending');
            return response.data;
        },
        async updateListingVerificationStatus(data: { verificationId: string, status: 'verified' | 'rejected', adminComment?: string }) {
            const response = await instance.put('/admin/verifications/listings/status', data);
            return response.data;
        },
    },

    // Verification Center
    verification: {
        async submitPropertyDocument(propertyId: string, formData: FormData) {
            const response = await instance.post(`/verification/property/${propertyId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        async getPropertyVerificationStatus(propertyId: string) {
            const response = await instance.get(`/verification/property/${propertyId}/status`);
            return response.data;
        },
        async submitProfessionalDocs(formData: FormData) {
            const response = await instance.post('/verification/professional/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        }
    },

    // Properties
    async getProperties(params?: { type?: string; category?: string; location?: string; search?: string; minPrice?: number; maxPrice?: number; limit?: number; page?: number }) {
        try {
            const response = await instance.get('/properties', { params });
            let rawData = response.data;
            if (!Array.isArray(rawData)) {
                rawData = rawData.properties || rawData.data || rawData.listings || [];
            }
            return rawData.map((p: any) => ({
                ...p,
                id: p.id || p._id
            }));
        } catch (err) {
            console.warn('Backend unavailable, using mock data fallback', err);
            let filtered = [...mockProperties];
            if (params?.type) filtered = filtered.filter(p => p.propertyType === params.type);
            if (params?.category) filtered = filtered.filter(p => p.category === params.category);
            return filtered;
        }
    },

    async getPropertyById(id: string | number) {
        try {
            const response = await instance.get(`/properties/${id}`);
            let prop = response.data;
            if (prop && !prop.title) {
                prop = prop.property || prop.data || prop.listing || prop;
            }
            return { ...prop, id: prop.id || prop._id };
        } catch (err) {
            const mock = mockProperties.find(p => p.id === id);
            if (!mock) throw new Error('Property not found');
            return mock;
        }
    },

    async addProperty(data: PropertyData) {
        const response = await instance.post('/properties', data);
        return response.data;
    },

    async updateProperty(id: string | number, data: Partial<PropertyData>) {
        const response = await instance.put(`/properties/${id}`, data);
        return response.data;
    },

    async deleteProperty(id: string | number) {
        const response = await instance.delete(`/properties/${id}`);
        return response.data;
    },

    // Analytics
    analytics: {
        async getMarketStats() {
            try {
                const response = await instance.get('/analytics/stats');
                return response.data.data;
            } catch (err) {
                return {
                    totalListings: 120,
                    verifiedBrokers: 45,
                    averagePrice: 35000000,
                    trends: [
                        { month: 'Jan', price: 32000000 },
                        { month: 'Feb', price: 34000000 },
                        { month: 'Mar', price: 35000000 },
                        { month: 'Apr', price: 36000000 },
                        { month: 'May', price: 35500000 },
                        { month: 'Jun', price: 37000000 }
                    ]
                };
            }
        },
        async getAdminStats() {
            const response = await instance.get('/analytics/admin');
            return response.data;
        },
        async getLeadStats() {
            const response = await instance.get('/analytics/leads');
            return response.data;
        }
    },
    support: {
        async submitContactMessage(data: { name: string; email: string; subject: string; message: string }) {
            const response = await instance.post('/support/submit', data);
            return response.data;
        },
        async getContactMessages() {
            const response = await instance.get('/support/messages');
            return response.data;
        },
        async updateMessageStatus(id: string, status: string) {
            const response = await instance.put(`/support/message/${id}`, { status });
            return response.data;
        }
    },
    // AI Features
    async getRecommendations(id: string | number) {
        const response = await instance.get(`/properties/${id}/recommendations`);
        const recommendations = response.data.recommendations || [];
        return recommendations.map((p: any) => ({
            ...p,
            id: p.id || p._id
        }));
    },

    async aiSearch(query: string) {
        const response = await instance.get('/properties/ai-search', { params: { query } });
        return response.data;
    },

    async getPropertyInsight(propertyData: any) {
        const response = await instance.post('/ai/property-insight', { propertyData });
        return response.data;
    },

    // Engagement Features
    engagement: {
        async createInquiry(data: { propertyId: string | number; type: 'contact' | 'booking'; message?: string; bookingDate?: string }) {
            const response = await instance.post('/engagement/inquiry', data);
            return response.data;
        },
        async toggleFavorite(propertyId: string | number) {
            const response = await instance.post('/engagement/favorite', { propertyId });
            return response.data;
        },
        async getFavorites() {
            const response = await instance.get('/engagement/favorites');
            return response.data;
        },
        async getInquiries(params?: { role?: 'buyer' | 'seller' | 'broker' }) {
            const response = await instance.get('/engagement/inquiries', { params });
            return response.data;
        },
        async updateInquiryStatus(id: string | number, status: string) {
            const response = await instance.put(`/engagement/inquiry/${id}/status`, { status });
            return response.data;
        }
    },

    // Chat Features
    chat: {
        async getHistory(userId: string | number) {
            const response = await instance.get(`/chat/history/${userId}`);
            return response.data;
        },
        async getConversations() {
            const response = await instance.get('/chat/conversations');
            return response.data;
        }
    }
};

export default instance;

# SmartState Frontend Development Guide

This guide will help you build a premium, AI-powered real estate platform that integrates with the existing backend.

## 1. Project Initialization
We recommend using **Vite** for a fast development experience.
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Essential Dependencies
```bash
npm install axios react-router-dom lucide-react framer-motion chart.js react-chartjs-2 tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 2. Design System (Tailwind CSS)
To achieve a "WOW" factor, use a high-end dark theme. Update your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#020617', // Slate 950
          900: '#0f172a', // Slate 900
          DEFAULT: '#020617'
        },
        primary: '#2563eb', // Blue 600
        secondary: '#6366f1', // Indigo 500
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
```

## 3. Core Features to Implement

### AI-Powered Search UI
Instead of a simple form, create a "Command Palette" style search bar.
- **Tip**: Use `framer-motion` for smooth opening animations.
- **AI Logic**: When a user types, simulate intelligent suggestions (e.g., "Properties in DHA under 50M").

### Real-Time Analytics Dashboard
Use `react-chartjs-2` to visualize data from the `/api/analytics/stats` endpoint.
- **Charts**: Show price trends by property type and broker activity.
- **Aesthetic**: Use semi-transparent gradients for chart areas to match the glassmorphic UI.

### Verified Broker System
- Fetch properties using `/api/properties`.
- Check `createdBy.isVerifiedBroker` to display a "Verified" badge on property cards.
- **UI**: Use a glowing blue tick icon for verified brokers.

## 4. API Integration
Setup an Axios instance with base URL `http://localhost:5000/api`.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically add the Auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 5. Page Roadmap
1. **Home**: Hero section with AI Search, Stats Overview (from Analytics API).
2. **Auth**: Login/Signup with role selection (Buyer, Seller, Broker).
3. **Listings**: Grid view with advanced filters (Price, Type, Keyword).
4. **Property Details**: Gallery, Map simulation, and Broker info.
5. **Dashboard**: Broker-specific analytics and listing management.

## 6. Pro Tips for "WOW" Factor
- **Glassmorphism**: Use `bg-white/10 backdrop-blur-md border border-white/20` for cards.
- **Transitions**: Use `framer-motion`'s `<AnimatePresence>` for page transitions.
- **Micro-interactions**: Add hover scaling on buttons and property cards.
- **Skeleton Screens**: Show shimmering placeholders while data is loading.

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Listings from './pages/Listings';
import PropertyDetails from './pages/PropertyDetails';
import AddEditListing from './pages/AddEditListing';
import MyListing from './pages/MyListing';
import Auth from './pages/Auth';
import VerifyOtp from './pages/VerifyOtp';
import Contact from './pages/Contact';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ChatPopup from './components/ChatPopup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!token || !userStr) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const role = user.role || user.type;
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

import { ChatProvider, useChat } from './contexts/ChatContext';

function App() {
  return (
    <ChatProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-950">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listing/:id" element={<PropertyDetails />} />
              <Route path="/add-listing" element={
                <ProtectedRoute allowedRoles={['seller', 'broker']}>
                  <AddEditListing />
                </ProtectedRoute>
              } />
              <Route path="/edit-listing/:id" element={
                <ProtectedRoute allowedRoles={['seller', 'broker']}>
                  <AddEditListing />
                </ProtectedRoute>
              } />
              <Route path="/my-listings" element={
                <ProtectedRoute allowedRoles={['seller', 'broker']}>
                  <MyListing />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute allowedRoles={['seller', 'broker', 'buyer']}>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={['seller', 'broker', 'buyer']}>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/verify" element={<VerifyOtp />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <ChatPopup />
          <NotificationHandler />
          <Footer />
          <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
        </div>
      </Router>
    </ChatProvider>
  );
}

const NotificationHandler = () => {
  useChat();

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW Registered', reg))
        .catch(err => console.error('SW Registration Failed', err));
    }

    // Request Notification Permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return null;
};

export default App;

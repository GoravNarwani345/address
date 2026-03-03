import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, List, LogIn, PlusCircle, BarChart2, User, Menu, X, Mail, Heart, MessageSquare, ShieldCheck } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userInitial, setUserInitial] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) {
        const u = JSON.parse(uStr);
        const name = u.name || u.username || u.email || '';
        setUserInitial(name ? String(name).charAt(0).toUpperCase() : null);
        setRole(u.role || u.type || null);
      } else {
        setUserInitial(null);
        setRole(null);
      }
    } catch (e) {
      setUserInitial(null);
      setRole(null);
    }

    const onAuthChanged = () => {
      const nt = localStorage.getItem('token');
      setToken(nt);
      try {
        const uStr2 = localStorage.getItem('user');
        if (uStr2) {
          const u2 = JSON.parse(uStr2);
          const name2 = u2.name || u2.username || u2.email || '';
          setUserInitial(name2 ? String(name2).charAt(0).toUpperCase() : null);
          setRole(u2.role || u2.type || null);
        } else {
          setUserInitial(null);
          setRole(null);
        }
      } catch {
        setUserInitial(null);
        setRole(null);
      }
    };

    window.addEventListener('authChanged', onAuthChanged);
    return () => window.removeEventListener('authChanged', onAuthChanged);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUserInitial(null);
    setIsProfileOpen(false);
    window.dispatchEvent(new Event('authChanged'));
    navigate('/auth');
  };

  return (
    <>
      <nav className="fixed top-0 w-full glass text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition tracking-tight">
            ADREDSS
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/" className="flex items-center gap-2 hover:text-blue-400 transition">
              <Home size={20} /> Home
            </Link>
            <Link to="/listings" className="flex items-center gap-2 hover:text-blue-400 transition">
              <List size={20} /> Listings
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-400 transition">
              <BarChart2 size={20} /> Market
            </Link>
            {(role === 'seller' || role === 'broker') && (
              <Link to="/add-listing" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition text-sm font-semibold">
                <PlusCircle size={18} />
                <span>Add Listing</span>
              </Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-bold">
                <ShieldCheck size={18} />
                <span>Admin Tab</span>
              </Link>
            )}
            {token && (
              <Link to="/favorites" className="flex items-center gap-2 hover:text-blue-400 transition" title="Your Favorites">
                <Heart size={20} /> Favorites
              </Link>
            )}
            {token && (
              <Link to="/messages" className="flex items-center gap-2 hover:text-blue-400 transition" title="Messages">
                <MessageSquare size={20} /> Messages
              </Link>
            )}
            <Link to="/contact" className="flex items-center gap-2 hover:text-blue-400 transition">
              <Mail size={20} /> Contact
            </Link>
            {token ? (
              <>
                <button
                  onClick={toggleProfile}
                  className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg"
                  title="Open profile"
                >
                  {userInitial}
                </button>
              </>
            ) : (
              <Link to="/auth" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                <LogIn size={20} /> Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 text-white hover:text-blue-400 transition"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-lg transition"
                onClick={toggleSidebar}
              >
                <Home size={20} /> Home
              </Link>
              <Link
                to="/listings"
                className="flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-lg transition"
                onClick={toggleSidebar}
              >
                <List size={20} /> Listings
              </Link>
              {(role === 'seller' || role === 'broker') && (
                <Link
                  to="/add-listing"
                  className="flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-lg transition"
                  onClick={toggleSidebar}
                >
                  <User size={20} /> Add Listing
                </Link>
              )}
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 py-3 px-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition"
                  onClick={toggleSidebar}
                >
                  <ShieldCheck size={20} /> Admin Tab
                </Link>
              )}
              {token && (
                <Link
                  to="/favorites"
                  className="flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-lg transition"
                  onClick={toggleSidebar}
                >
                  <Heart size={20} /> Favorites
                </Link>
              )}
              {token && (
                <Link
                  to="/messages"
                  className="flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-lg transition"
                  onClick={toggleSidebar}
                >
                  <MessageSquare size={20} /> Messages
                </Link>
              )}
              <Link
                to="/contact"
                className="flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-lg transition"
                onClick={toggleSidebar}
              >
                <Mail size={20} /> Contact
              </Link>
              {token ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { toggleSidebar(); toggleProfile(); }}
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg"
                  >
                    {userInitial}
                  </button>
                  <button
                    onClick={() => { toggleSidebar(); handleLogout(); }}
                    className="ml-2 py-2 px-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  onClick={toggleSidebar}
                >
                  <LogIn size={20} /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} token={token} onLogout={handleLogout} />
    </>
  );
};

export default Navbar;

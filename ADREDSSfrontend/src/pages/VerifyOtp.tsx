import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Priority: 1. Navigation state, 2. Local storage
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try { const u = JSON.parse(userStr); if (u?.email) setEmail(u.email); }
        catch { }
      }
    }
  }, [location]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!email || !otp) {
      toast.error('Email and OTP are required');
      setError('Email and OTP are required');
      return
    }
    setLoading(true);
    try {
      const data = await api.auth.verifyOtp({ email, otp });
      if (data.error || data.message === 'Error') { throw new Error(data.message || 'Verification failed') }

      toast.success('Email verified successfully!');

      // update local user
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const updated = { ...u, verified: true };
          localStorage.setItem('user', JSON.stringify(updated));
        } catch { }
      }
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.role === 'seller') navigate('/my-listings'); else navigate('/');
      }, 800);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unexpected error';
      toast.error(errMsg);
      setError(errMsg);
    }
    finally { setLoading(false) }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email required to resend');
      setError('Email required to resend');
      return
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const data = await api.auth.sendOtp({ email, purpose: 'verify' });
      if (data.error || data.message === 'Error') { throw new Error(data.message || 'Resend failed') }
      toast.success('OTP sent successfully');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unexpected error';
      toast.error(errMsg);
      setError(errMsg);
    }
    finally { setLoading(false) }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Verify Email</h1>
        <p className="text-gray-400 mb-8 text-center">Enter the OTP sent to {email}</p>

        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-xl text-red-200 text-sm">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-xl text-green-200 text-sm">{success}</div>}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-60 disabled:transform-none"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle, Loader, ShieldCheck, Briefcase, ShoppingCart } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'buyer' | 'seller' | 'broker';
  cnicFront: File | null;
  cnicBack: File | null;
  agencyName: string;
  licenseNumber: string;
  licenseDocument: File | null;
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'buyer',
    cnicFront: null, cnicBack: null, agencyName: '', licenseNumber: '', licenseDocument: null
  });

  const isLogin = authMode === 'login';
  const isSignup = authMode === 'signup';
  const isForgot = authMode === 'forgot';
  const isReset = authMode === 'reset';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.verified) {
          if (u.role === 'admin') navigate('/admin');
          else navigate('/');
        } else {
          navigate('/verify');
        }
      } catch { /* ignore */ }
    }
  }, [navigate]);

  const clearErrors = () => setError('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value as any })); clearErrors();
  };

  const handleFileUpload = (type: 'front' | 'back' | 'license', file: File) => {
    if (type === 'front') setFormData(p => ({ ...p, cnicFront: file }));
    else if (type === 'back') setFormData(p => ({ ...p, cnicBack: file }));
    else setFormData(p => ({ ...p, licenseDocument: file }));
    clearErrors();
  };

  const validateForm = (): boolean => {
    if (!formData.email.includes('@')) { setError('Enter a valid professional email'); return false }
    if (isLogin || isSignup || isReset) {
      if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return false }
    }
    if (isSignup || isReset) {
      if (!formData.name.trim() && isSignup) { setError('Full name is required'); return false }
      if (!formData.phone.trim() && isSignup) { setError('Phone number is required'); return false }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false }
      if (formData.role === 'seller' && (!formData.cnicFront || !formData.cnicBack)) { setError('CNIC images are required for verification'); return false }
      if (formData.role === 'broker' && (!formData.agencyName.trim() || !formData.licenseNumber.trim() || !formData.licenseDocument)) { setError('All broker verification details are required'); return false }
    }
    if (isReset && !otp) { setError('OTP is required'); return false }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearErrors(); if (!validateForm()) return; setLoading(true);
    try {
      if (isLogin) {
        const data = await api.auth.signIn({ email: formData.email, password: formData.password });
        handleAuthSuccess(data);
      } else if (isSignup) {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('email', formData.email);
        fd.append('phone', formData.phone);
        fd.append('password', formData.password);
        fd.append('role', formData.role);
        if (formData.role === 'seller') {
          if (formData.cnicFront) fd.append('cnicFront', formData.cnicFront);
          if (formData.cnicBack) fd.append('cnicBack', formData.cnicBack);
        }
        if (formData.role === 'broker') {
          fd.append('agencyName', formData.agencyName);
          fd.append('licenseNumber', formData.licenseNumber);
          if (formData.licenseDocument) fd.append('licenseDocument', formData.licenseDocument);
        }
        const data = await api.auth.signUp(fd);
        handleAuthSuccess(data);
      } else if (isForgot) {
        await api.auth.forgotPassword({ email: formData.email });
        toast.success('Verification code sent to your email');
        setAuthMode('reset');
      } else if (isReset) {
        await api.auth.resetPassword({ email: formData.email, otp, newPassword: formData.password });
        toast.success('Password updated! Please sign in.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      toast.error(err.message || 'Connection failed');
    } finally { setLoading(false) }
  };

  const handleAuthSuccess = (data: any) => {
    if (data.error || data.message === 'Error') {
      throw new Error(data.message || 'Authentication failed');
    }
    const { user, token } = data;
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('authChanged'));
      if (!user.verified) {
        toast.warning('Verify your account to access all features');
        navigate('/verify', { state: { email: user.email } });
      } else {
        toast.success(isLogin ? `Welcome back, ${user.name}` : 'Account secured successfully!');
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'seller' || user.role === 'broker') navigate('/my-listings');
        else navigate('/');
      }
    } else if (isSignup) {
      toast.success('Registration successful. Please sign in.');
      setAuthMode('login');
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-primary/30">
      {/* Background Decorative Element */}
      <div className="fixed top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="glass p-8 md:p-12 rounded-[2.5rem] border-white/5 shadow-3xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3">
              {isLogin ? 'Welcome to ' : isSignup ? 'Join ' : isForgot ? 'Account ' : 'Reset '}
              <span className="text-primary italic">ADREDSS</span>
            </h1>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Secure access to your intelligent property ecosystem.' :
                isSignup ? 'Start your journey with AI-powered real estate.' :
                  isForgot ? 'Enter your email to receive a reset code.' : 'Enter the code and your new password.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                <RoleOption active={formData.role === 'buyer'} onClick={() => setFormData(p => ({ ...p, role: 'buyer' }))} icon={ShoppingCart} label="Buyer" />
                <RoleOption active={formData.role === 'seller'} onClick={() => setFormData(p => ({ ...p, role: 'seller' }))} icon={Briefcase} label="Seller" />
                <RoleOption active={formData.role === 'broker'} onClick={() => setFormData(p => ({ ...p, role: 'broker' }))} icon={ShieldCheck} label="Broker" />
              </div>
            )}

            <div className="space-y-4">
              {isSignup && (
                <div className="relative">
                  <User className="absolute left-4 top-4 text-slate-500" size={20} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-4 pl-12 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="Full Professional Name" />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-500" size={20} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 pl-12 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="Corporate Email Address" />
              </div>

              {isSignup && (
                <div className="relative">
                  <Phone className="absolute left-4 top-4 text-slate-500" size={20} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 pl-12 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="Mobile Number" />
                </div>
              )}

              {isReset && (
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-4 text-slate-500" size={20} />
                  <input type="text" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-4 pl-12 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-bold tracking-[0.5em] text-center" placeholder="000000" maxLength={6} />
                </div>
              )}

              {(isLogin || isSignup || isReset) && (
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-slate-500" size={20} />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full p-4 pl-12 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder={isReset ? "New Secure Password" : "Secure Password"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              {(isSignup || isReset) && (
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-slate-500" size={20} />
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-4 pl-12 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="Confirm Secure Password" />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end pr-2">
                  <button type="button" onClick={() => setAuthMode('forgot')} className="text-sm text-primary hover:underline font-bold">Forgot Password?</button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isSignup && formData.role !== 'buyer' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-2">Verification details</h3>
                  {formData.role === 'broker' ? (
                    <div className="space-y-4">
                      <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange} placeholder="Official Agency Name" className="w-full p-4 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none" />
                      <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="License Serial Number" className="w-full p-4 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none" />
                      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload('license', f); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <ShieldCheck className="mx-auto mb-2 text-primary" size={24} />
                        <p className="text-slate-400 text-sm font-medium">{formData.licenseDocument ? (formData.licenseDocument as any).name : 'Upload License (PDF/JPG)'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <FileDrop onUpload={(f) => handleFileUpload('front', f)} label="CNIC Front" status={!!formData.cnicFront} />
                      <FileDrop onUpload={(f) => handleFileUpload('back', f)} label="CNIC Back" status={!!formData.cnicBack} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full p-5 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
              {loading ? <Loader className="animate-spin" size={24} /> : (
                <>
                  {isLogin ? <LogIn size={22} /> : isSignup ? <UserPlus size={22} /> : <ShieldCheck size={22} />}
                  {isLogin ? 'Enter ADREDSS' : isSignup ? 'Create My Account' : isForgot ? 'Send Verification Code' : 'Update Password'}
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 font-medium">
              {isLogin ? "Don't have an account yet? " : isSignup ? 'Already have a secure account? ' : 'Remember your password? '}
              <button onClick={() => { setAuthMode(isSignup || isForgot || isReset ? 'login' : 'signup'); clearErrors(); }} className="text-primary font-black hover:underline underline-offset-4 ml-1">
                {isSignup || isForgot || isReset ? 'Sign In' : 'Register Now'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const RoleOption = ({ active, onClick, icon: Icon, label }: any) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-3xl border text-center cursor-pointer transition-all ${active
      ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105'
      : 'glass border-white/5 text-slate-500 hover:text-white hover:border-white/20'
      }`}
  >
    <Icon size={24} className={`mx-auto mb-2 ${active ? 'text-white' : 'text-slate-600'}`} />
    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </div>
);

const FileDrop = ({ onUpload, label, status }: { onUpload: (f: File) => void, label: string, status: boolean }) => (
  <div className={`border-2 border-dashed rounded-2xl p-4 text-center relative transition-all ${status ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30'}`}>
    <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} className="absolute inset-0 opacity-0 cursor-pointer" />
    {status ? (
      <CheckCircle className="mx-auto mb-1 text-primary" size={20} />
    ) : (
      <div className="w-8 h-8 mx-auto mb-1 bg-slate-900 rounded-lg flex items-center justify-center text-slate-600">
        +
      </div>
    )}
    <p className={`text-[10px] font-black uppercase tracking-widest ${status ? 'text-primary' : 'text-slate-500'}`}>{label}</p>
  </div>
);

export default Auth;

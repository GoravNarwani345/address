import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Bell, User as UserIcon, Check, X as CloseIcon, Loader2, Edit2, Shield, Camera, Save, CheckCircle, Fingerprint, FileText, Briefcase, Info, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import type { UserData } from '../services/api';

const BASE_URL = 'http://localhost:5000';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onLogout?: () => void;
};

const ProfileModal: React.FC<Props> = ({ isOpen, onClose, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security' | 'verification'>('profile');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserData | null>(null);

  // Profile Edit Data
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change Data
  const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Verification Data
  const [verifSubView, setVerifSubView] = useState<'overview' | 'identity' | 'professional'>('overview');
  const [verifFiles, setVerifFiles] = useState<{
    cnicFront: File | null;
    cnicBack: File | null;
    license: File | null;
  }>({ cnicFront: null, cnicBack: null, license: null });
  const [verifData, setVerifData] = useState({
    fbrRegistrationNumber: '',
    agencyAddress: '',
    agencyPhone: '',
    agencyName: '',
    licenseNumber: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    if (!token) {
      setError('Not authenticated');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.auth.getUser();
        if (data.success) {
          setProfile(data.user);
          setEditData({ name: data.user.name || '', phone: data.user.phone || '' });
        } else {
          throw new Error(data.message || 'Failed to fetch profile');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, token]);

  const handleUpdateSetting = async (key: 'email' | 'push' | 'chat', value: boolean) => {
    if (!profile) return;

    setUpdating(true);
    try {
      const data = await api.auth.updateSettings({ [key]: value });
      if (data.success) {
        setProfile((prev: any) => ({
          ...prev,
          notificationSettings: data.settings
        }));
        toast.success(`Notification ${key} updated`);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update setting');
    } finally {
      setUpdating(false);
    }
  };

  const handleProfileUpdate = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('phone', editData.phone);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const data = await api.auth.updateProfile(formData);
      if (data.success) {
        setProfile(data.user);
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        toast.success('Profile updated successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setUpdating(true);
    try {
      const data = await api.auth.changePassword({
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      });
      if (data.success) {
        toast.success('Password changed successfully');
        setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setActiveTab('profile');
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (verifSubView === 'identity' && (!verifFiles.cnicFront || !verifFiles.cnicBack)) {
      return toast.error('Both CNIC front and back are required');
    }
    if (verifSubView === 'professional' && (!verifFiles.cnicFront || !verifFiles.cnicBack || !verifFiles.license)) {
      return toast.error('All documents (CNIC + License) are required for professional verification');
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      if (verifFiles.cnicFront) formData.append('cnic_front', verifFiles.cnicFront);
      if (verifFiles.cnicBack) formData.append('cnic_back', verifFiles.cnicBack);
      if (verifFiles.license) formData.append('licenseDocument', verifFiles.license);

      formData.append('fbrRegistrationNumber', verifData.fbrRegistrationNumber);
      formData.append('agencyAddress', verifData.agencyAddress);
      formData.append('agencyPhone', verifData.agencyPhone);
      formData.append('agencyName', verifData.agencyName);
      formData.append('licenseNumber', verifData.licenseNumber);

      const data = await api.verification.submitProfessionalDocs(formData);
      if (data.success) {
        toast.success('Documents submitted successfully! Waiting for admin review.');
        setProfile(data.user);
        setVerifSubView('overview');
        setVerifFiles({ cnicFront: null, cnicBack: null, license: null });
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit documents');
    } finally {
      setUpdating(false);
    }
  };

  const getAvatarUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center px-4"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-900 border border-white/10 text-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden glass">
        {/* Header Tabs */}
        <div className="flex border-b border-white/5 bg-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', icon: UserIcon, label: 'Profile' },
            { id: 'verification', icon: Fingerprint, label: 'Verification' },
            { id: 'settings', icon: Bell, label: 'Settings' },
            { id: 'security', icon: Shield, label: 'Security' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
          <button onClick={onClose} className="p-4 text-slate-500 hover:text-white transition-colors border-l border-white/5">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-slate-400 font-medium">Fetching your data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4 font-bold text-xl">Initialization Error</div>
              <p className="text-slate-400 mb-6">{error}</p>
              <button onClick={onClose} className="bg-primary px-6 py-2 rounded-xl font-bold">Close Portal</button>
            </div>
          ) : profile && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="relative">
                        {avatarPreview || getAvatarUrl(profile.avatar) ? (
                          <img
                            src={avatarPreview || getAvatarUrl(profile.avatar)!}
                            alt="avatar"
                            className="w-24 h-24 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xl shadow-primary/10"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/20">
                            {profile.name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Camera size={24} className="text-white" />
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAvatarFile(file);
                            setAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-lg font-bold focus:outline-none focus:border-primary transition-colors"
                          placeholder="Your Name"
                        />
                      ) : (
                        <h3 className="text-2xl font-bold mb-1">{profile.name || profile.username || 'Anonymous User'}</h3>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black uppercase rounded tracking-widest">{profile.role || 'Inquirer'}</span>
                        <span className="text-slate-500 text-xs font-medium">Member since {new Date(profile.created_at || profile.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                      disabled={updating}
                      className={`p-3 rounded-xl transition-all ${isEditing ? 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-primary/20 text-primary hover:bg-primary hover:text-white'}`}
                    >
                      {updating ? <Loader2 size={20} className="animate-spin" /> : (isEditing ? <Save size={20} /> : <Edit2 size={20} />)}
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => { setIsEditing(false); setAvatarPreview(null); setAvatarFile(null); }}
                        className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <CloseIcon size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Address</p>
                      <p className="font-bold text-slate-200">{profile.email || 'Not Configured'}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone Number</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:border-primary"
                        />
                      ) : (
                        <p className="font-bold text-slate-200">{profile.phone || 'No Mobile Linked'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex pt-4">
                    <button onClick={onLogout} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-xl font-bold transition-all text-sm ml-auto">
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/20 p-3 rounded-2xl">
                      <Bell className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Notification Channels</h4>
                      <p className="text-slate-500 text-xs">Configure how you receive critical property updates.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: 'email', label: 'Email Alerts', desc: 'Direct updates to your inbox' },
                      { id: 'push', label: 'Real-time Push', desc: 'Immediate browser notifications' },
                      { id: 'chat', label: 'Direct Messages', desc: 'In-app discussion alerts' }
                    ].map((setting) => {
                      const id = setting.id as 'email' | 'push' | 'chat';
                      const isEnabled = profile.notificationSettings?.[id] ?? true;
                      return (
                        <div key={id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex-1">
                            <p className="font-bold text-slate-200">{setting.label}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{setting.desc}</p>
                          </div>
                          <button
                            disabled={updating}
                            onClick={() => handleUpdateSetting(id, !isEnabled)}
                            className={`w-14 h-8 rounded-full transition-all relative ${isEnabled ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md flex items-center justify-center ${isEnabled ? 'left-7' : 'left-1'}`}>
                              {isEnabled ? <Check size={12} className="text-primary font-bold" /> : <div className="w-1 h-1 bg-slate-400 rounded-full" />}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/20 p-3 rounded-2xl">
                      <Shield className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Password & Security</h4>
                      <p className="text-slate-500 text-xs">Manage your account credentials securely.</p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Current Password</label>
                      <input
                        type="password"
                        required
                        value={pwdData.currentPassword}
                        onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">New Password</label>
                        <input
                          type="password"
                          required
                          value={pwdData.newPassword}
                          onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                          placeholder="Min 6 chars"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={pwdData.confirmPassword}
                          onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      {updating ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'verification' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-primary/20 p-3 rounded-2xl">
                      <Fingerprint className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Verification Center</h4>
                      <p className="text-slate-500 text-xs">Elevate your trust level with professional verification.</p>
                    </div>
                  </div>

                  {/* Status Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={`p-4 rounded-2xl border ${profile.verificationLevel === 'professional' ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className={profile.verificationLevel !== 'none' ? 'text-green-500' : 'text-slate-500'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
                      </div>
                      <p className="text-xs font-bold text-slate-300">Verified</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${['identity', 'professional'].includes(profile.verificationLevel) ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className={['identity', 'professional'].includes(profile.verificationLevel) ? 'text-green-500' : 'text-slate-500'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Identity</span>
                      </div>
                      <p className="text-xs font-bold text-slate-300">{['identity', 'professional'].includes(profile.verificationLevel) ? 'Verified' : 'Required'}</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${profile.verificationLevel === 'professional' ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className={profile.verificationLevel === 'professional' ? 'text-green-500' : 'text-slate-500'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Professional</span>
                      </div>
                      <p className="text-xs font-bold text-slate-300">{profile.verificationLevel === 'professional' ? 'Verified' : profile.role === 'broker' ? 'Required' : 'Optional'}</p>
                    </div>
                  </div>

                  {profile.verificationLevel !== 'professional' && (
                    <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                      {verifSubView === 'overview' ? (
                        <>
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1">
                              <Info size={18} />
                            </div>
                            <div>
                              <h5 className="font-bold text-white">Upgrade to Professional Status</h5>
                              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                Verified {profile.role === 'broker' ? 'brokers' : 'sellers'} enjoy 2x more visibility and the "Verified" badge on all listings. Submit your documents for review.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 pt-4">
                            <button
                              onClick={() => setVerifSubView('identity')}
                              className="flex items-center justify-between p-4 bg-slate-900 border border-white/10 rounded-2xl hover:border-primary/50 transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                  <FileText size={20} />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-white">Identity Verification (CNIC)</p>
                                  <p className="text-[10px] font-medium text-slate-500">Government ID (Front & Back)</p>
                                </div>
                              </div>
                              <ChevronRight size={18} className="text-slate-600" />
                            </button>

                            {(profile.role === 'broker' || profile.role === 'seller') && (
                              <button
                                onClick={() => setVerifSubView('professional')}
                                className="flex items-center justify-between p-4 bg-slate-900 border border-white/10 rounded-2xl hover:border-primary/50 transition-all group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                    <Briefcase size={20} />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-white">Professional License</p>
                                    <p className="text-[10px] font-medium text-slate-500">RERA License / FBR Registration</p>
                                  </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-600" />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6">
                          <button
                            onClick={() => setVerifSubView('overview')}
                            className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                          >
                            <ChevronRight size={14} className="rotate-180" /> Back to Overview
                          </button>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CNIC Front</label>
                                <div
                                  onClick={() => document.getElementById('cnic-front')?.click()}
                                  className="aspect-[1.6/1] bg-slate-900 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
                                >
                                  {verifFiles.cnicFront ? (
                                    <img src={URL.createObjectURL(verifFiles.cnicFront)} className="w-full h-full object-cover" alt="CNIC Front" />
                                  ) : (
                                    <>
                                      <Camera size={24} className="text-slate-600 mb-2" />
                                      <p className="text-[10px] text-slate-500">Upload Front</p>
                                    </>
                                  )}
                                  <input
                                    type="file" id="cnic-front" className="hidden" accept="image/*"
                                    onChange={(e) => setVerifFiles({ ...verifFiles, cnicFront: e.target.files?.[0] || null })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CNIC Back</label>
                                <div
                                  onClick={() => document.getElementById('cnic-back')?.click()}
                                  className="aspect-[1.6/1] bg-slate-900 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
                                >
                                  {verifFiles.cnicBack ? (
                                    <img src={URL.createObjectURL(verifFiles.cnicBack)} className="w-full h-full object-cover" alt="CNIC Back" />
                                  ) : (
                                    <>
                                      <Camera size={24} className="text-slate-600 mb-2" />
                                      <p className="text-[10px] text-slate-500">Upload Back</p>
                                    </>
                                  )}
                                  <input
                                    type="file" id="cnic-back" className="hidden" accept="image/*"
                                    onChange={(e) => setVerifFiles({ ...verifFiles, cnicBack: e.target.files?.[0] || null })}
                                  />
                                </div>
                              </div>
                            </div>

                            {verifSubView === 'professional' && (
                              <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agency Name</label>
                                    <input
                                      type="text"
                                      value={verifData.agencyName}
                                      onChange={(e) => setVerifData({ ...verifData, agencyName: e.target.value })}
                                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                                      placeholder="Elite Estates"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">License Number</label>
                                    <input
                                      type="text"
                                      value={verifData.licenseNumber}
                                      onChange={(e) => setVerifData({ ...verifData, licenseNumber: e.target.value })}
                                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                                      placeholder="L-123456"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Professional License / FBR Copy</label>
                                  <div
                                    onClick={() => document.getElementById('license-doc')?.click()}
                                    className="w-full h-32 bg-slate-900 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all"
                                  >
                                    {verifFiles.license ? (
                                      <div className="flex items-center gap-3 text-primary font-bold">
                                        <FileText size={20} />
                                        <span>{verifFiles.license.name}</span>
                                      </div>
                                    ) : (
                                      <>
                                        <Briefcase size={24} className="text-slate-600 mb-2" />
                                        <p className="text-xs text-slate-500">Upload License (Image or PDF)</p>
                                      </>
                                    )}
                                    <input
                                      type="file" id="license-doc" className="hidden" accept="image/*,application/pdf"
                                      onChange={(e) => setVerifFiles({ ...verifFiles, license: e.target.files?.[0] || null })}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FBR NTN</label>
                                    <input
                                      type="text"
                                      value={verifData.fbrRegistrationNumber}
                                      onChange={(e) => setVerifData({ ...verifData, fbrRegistrationNumber: e.target.value })}
                                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                                      placeholder="1234567-8"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agency Phone</label>
                                    <input
                                      type="text"
                                      value={verifData.agencyPhone}
                                      onChange={(e) => setVerifData({ ...verifData, agencyPhone: e.target.value })}
                                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                                      placeholder="+92 3XX XXXXXXX"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={handleSubmitVerification}
                              disabled={updating}
                              className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                              {updating ? <Loader2 className="animate-spin" size={20} /> : 'Submit for Review'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {profile.verificationLevel === 'professional' && (
                    <div className="text-center py-12 px-6 bg-green-500/5 rounded-[2.5rem] border border-green-500/20">
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-green-500" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">Maximum Trust Level Achieved</h3>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto">
                        Your professional status is verified. You now have full access to all platform features and premium listing badges.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

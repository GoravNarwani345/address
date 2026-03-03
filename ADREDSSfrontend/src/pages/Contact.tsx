import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.warning('Please fill in all mission parameters.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.support.submitContactMessage(formData);
      if (response.success) {
        toast.success(response.message || 'Mission objective received! Our team will contact you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(response.message || 'Transmission failed.');
      }
    } catch (err) {
      console.error('Submission Error:', err);
      toast.error('Sever link failure. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-slate-950 text-white pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-blue-400 text-sm font-bold mb-6"
          >
            <Sparkles size={16} />
            <span>Concierge Support</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">Connect with <span className="text-primary italic">ADREDSS</span></h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Our property specialists are standing by to guide your intelligent real estate journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-10">
            <ContactCard
              icon={Mail}
              title="Email Architecture"
              info="support@adredss.ai"
              desc="Our team typically responds within 4 micro-cycles (2 hours)."
            />
            <ContactCard
              icon={Phone}
              title="Direct Line"
              info="(+92) 21-34567890"
              desc="Available 24/7 for premium club members."
            />
            <ContactCard
              icon={MapPin}
              title="Innovation Hub"
              info="ADREDSS Plaza, Qasimabad, Hyderabad"
              desc="Join us for a virtual reality tour of our latest properties."
            />
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="glass p-10 rounded-[2.5rem] border-white/5 space-y-6 shadow-3xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-slate-400 font-bold uppercase tracking-widest text-[10px] pl-2">Full name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="Identify yourself"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-slate-400 font-bold uppercase tracking-widest text-[10px] pl-2">Professional Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="your@domain.ai"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 font-bold uppercase tracking-widest text-[10px] pl-2">Inquiry Focus</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                  placeholder="What is your objective?"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 font-bold uppercase tracking-widest text-[10px] pl-2">Mission Parameters</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-primary/50 transition-all font-medium resize-none"
                  placeholder="Describe your property requirements or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full p-5 bg-primary hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({ icon: Icon, title, info, desc }: any) => (
  <div className="glass p-8 rounded-[2.5rem] border-white/5 flex items-start gap-6 hover:border-white/10 transition-colors group">
    <div className="bg-slate-800 p-4 rounded-2xl text-blue-400 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg flex items-center justify-center shrink-0">
      <Icon size={28} />
    </div>
    <div>
      <h3 className="text-xl font-bold mb-1 text-white">{title}</h3>
      <p className="text-blue-400 font-black mb-2 tracking-tight text-lg">{info}</p>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
)

export default Contact;

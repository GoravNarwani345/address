import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Users, Award, Star, ArrowUpRight, TrendingUp, Cpu, Shield, Video, Quote } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import AISearch from '../components/AISearch';
import { api } from '../services/api';
import type { PropertyData } from '../services/api';

const Home: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [featuredProperties, setFeaturedProperties] = useState<PropertyData[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      const data = await api.analytics.getMarketStats();
      setStats(data);
    };

    const fetchProperties = async () => {
      const properties = await api.getProperties({ limit: 3 });
      setFeaturedProperties(properties);
    };

    fetchStats();
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden animate-slide-up">
        <div
          className="absolute inset-0 bg-center bg-cover scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
          <div className={`transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-primary text-sm font-bold mb-8 shadow-2xl">
              <TrendingUp size={16} />
              <span>Real-time Market Insights</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-8 pb-2 tracking-tighter">
              Advanced Search. <br /> <span className="text-primary">Better Living.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with verified brokers and discover premium properties
              tailored to your lifestyle using our proprietary AI search engine.
            </p>

            <div className="w-full max-w-3xl mx-auto">
              <AISearch />
            </div>
          </div>
        </div>

        {/* Floating Stat Component (Hero) */}
        <div className="absolute bottom-12 right-12 hidden lg:block">
          <div className="glass p-6 rounded-3xl border-white/10 shadow-3xl flex items-center gap-6 animate-bounce-slow">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Market Status</p>
              <p className="text-xl font-black text-white">+12.5% Growth</p>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 mt-16 max-w-6xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Verified Listings', value: stats?.totalListings || '1,200+', icon: HomeIcon, delay: '0' },
            { label: 'Trusted Brokers', value: stats?.verifiedBrokers || '450+', icon: Users, delay: '100' },
            { label: 'Client Satisfaction', value: '4.9/5', icon: Star, delay: '200' },
            { label: 'Industry Awards', value: '25+', icon: Award, delay: '300' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`glass p-8 rounded-3xl border-white/5 shadow-2xl transition-all duration-700 transform hover:-translate-y-2 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${item.delay}ms` }}
            >
              <div className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors border border-white/5">
                <item.icon className="text-primary group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">{item.label}</h3>
              <p className="text-4xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Handpicked Exclusives</h2>
            <p className="text-slate-400 text-lg">The finest properties selected by our experts for quality and value.</p>
          </div>
          <Link to="/listings" className="group flex items-center gap-2 text-primary font-bold text-lg hover:underline underline-offset-8 transition-all">
            Browse All <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featuredProperties.slice(0, 3).map((property, idx) => (
            <div key={property.id || idx} className={`transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${idx * 150}ms` }}>
              <PropertyCard
                {...property}
                id={property.id!}
                price={typeof property.price === 'number' ? `PKR ${property.price.toLocaleString()}` : property.price}
                image={property.images?.[0] || property.image || `https://images.unsplash.com/photo-${idx === 0 ? '1600585154340-be6161a56a0c' : idx === 1 ? '1600596542815-ffad4c1539a9' : '1600607687960-5a4597a95abb'}?auto=format&fit=crop&w=800&q=80`}
                location={property.address || property.location || 'Location not available'}
                createdBy={property.createdBy}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Specialized Services */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Premium AI Services</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Beyond listings, we provide the intelligence layer for the most significant acquisition of your life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "AI Valuation Engine",
              desc: "Get real-time, predictive price modeling based on current Hyderabad market liquidity.",
              icon: Cpu,
              color: "text-blue-400"
            },
            {
              title: "Broker Verification",
              desc: "Every broker on ADREDSS undergoes a rigorous 5-point background and license check.",
              icon: Shield,
              color: "text-green-400"
            },
            {
              title: "Virtual Reality Tours",
              desc: "Experience properties in 8K resolution without leaving your current residence.",
              icon: Video,
              color: "text-purple-400"
            }
          ].map((service, idx) => (
            <div key={idx} className="glass p-10 rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all duration-500 group">
              <div className={`w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform`}>
                <service.icon className={service.color} size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Neighborhood Spotlight */}
      <section className="bg-slate-900/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Hyderabad Spotlight</h2>
              <p className="text-slate-400 text-lg">Detailed insights into the most coveted neighborhoods in the city.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Qasimabad",
                tag: "High Liquidity",
                img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                stats: "Luxury Hub"
              },
              {
                name: "Latifabad",
                tag: "Family Centric",
                img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                stats: "Established"
              },
              {
                name: "Citizen Colony",
                tag: "Peaceful",
                img: "https://images.unsplash.com/photo-1600607687960-5a4597a95abb?auto=format&fit=crop&w=800&q=80",
                stats: "Upcoming"
              }
            ].map((area, idx) => (
              <div key={idx} className="relative group rounded-[2.5rem] overflow-hidden aspect-4/5 cursor-pointer">
                <img src={area.img} alt={area.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4 inline-block">{area.tag}</span>
                  <h3 className="text-3xl font-black text-white mb-2">{area.name}</h3>
                  <p className="text-slate-300 font-bold tracking-widest uppercase text-xs">{area.stats}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Client Experiences</h2>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} className="text-yellow-500 fill-yellow-500" />)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              name: "Zubair Ahmed",
              role: "Property Investor",
              text: "The AI search accuracy in Hyderabad is phenomenal. Found a high-yield property in Latifabad within 3 days.",
              avatar: "ZA"
            },
            {
              name: "Sara Khan",
              role: "Homeowner",
              text: "Broker verification gave me the peace of mind I couldn't find anywhere else. Transparent and secure process.",
              avatar: "SK"
            }
          ].map((t, i) => (
            <div key={i} className="glass p-12 rounded-[2.5rem] border-white/5 relative">
              <Quote className="absolute top-10 right-10 text-primary/10" size={80} />
              <p className="text-xl text-slate-300 italic mb-10 leading-relaxed font-medium relative z-10">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-xl">{t.avatar}</div>
                <div>
                  <h4 className="text-white font-bold text-lg">{t.name}</h4>
                  <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 pb-32">
        <div className="relative rounded-[3rem] overflow-hidden p-16 md:p-24 text-center">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-xl border border-white/10" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8">Ready to evolve your lifestyle?</h2>
            <p className="text-slate-100 text-xl mb-12 leading-relaxed opacity-90">
              ADREDSS isn't just a platform; it's your personal real estate advisor.
              Join thousands of homeowners who found their perfect match through ADREDSS.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/listings" className="px-12 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-100 transition-all text-lg shadow-3xl">Get Started Today</Link>
              <Link to="/contact" className="px-12 py-5 glass border-white/20 text-white font-black rounded-2xl hover:bg-white/10 transition-all text-lg">Speak with a Specialist</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

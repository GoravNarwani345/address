import React from 'react';
import { Gavel, CheckCircle, AlertTriangle, Scale, Target, Users, Zap, Briefcase } from 'lucide-react';

const Terms: React.FC = () => (
  <div className="pt-28 min-h-screen bg-slate-950">
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 font-['Outfit']">
          <Gavel size={14} />
          Protocol Governance
        </div>
        <h1 className="text-6xl font-[900] text-white mb-6 tracking-tighter font-['Outfit'] uppercase">
          Operating <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 italic">Mandate</span>
        </h1>
        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto font-medium">
          The structural framework governing interaction within the ADREDSS Intelligence Ecosystem.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TermCard 
            icon={Target} 
            title="Search Integrity" 
            desc="Users must use the AI search for legitimate real estate discovery. Scraping or automated probing of our property neural-net is strictly prohibited."
          />
          <TermCard 
            icon={Users} 
            title="Verified Actors" 
            desc="Sellers and Brokers must maintain a Level-2 Verification status. Fraudulent listings will result in immediate network expulsion."
          />
          <TermCard 
            icon={Zap} 
            title="Neural Outputs" 
            desc="AI insights are data-driven suggestions. Final decisions rest with the user; ADREDSS is a support system, not a legal advisor."
          />
        </div>

        <div className="glass p-10 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/20 p-4 rounded-2xl text-primary">
              <Scale size={28} />
            </div>
            <h2 className="text-3xl font-black text-white font-['Outfit']">Fiduciary Responsibility</h2>
          </div>
          <div className="space-y-6 text-slate-400 leading-relaxed text-lg">
            <p>
              By accessing **ADREDSS**, you enter into a digital agreement to uphold the market integrity of the Sindh real estate sector. Every transaction initiated through our platform is subject to the local regulatory laws of Pakistan.
            </p>
            <div className="bg-blue-600/10 border-l-4 border-blue-500 p-6 rounded-r-2xl italic text-slate-300">
              "We provide the tools; you provide the vision. Together, we build a transparent future."
            </div>
            <p>
              Our automated price valuation mechanisms are based on real-time data ingestion. While highly accurate, we recommend professional onsite inspection before multi-million PKR asset transfers.
            </p>
          </div>
        </div>

        <div className="glass p-10 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row gap-8 items-center">
          <div className="shrink-0 p-6 bg-amber-500/10 rounded-full border border-amber-500/20">
            <AlertTriangle size={48} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2 font-['Outfit']">Limitation of Connectivity</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              ADREDSS maintains 99.9% uptime. However, during network upgrades or severe infrastructure maintenance in Hyderabad/Sindh, certain AI features may operate in low-fidelity mode.
            </p>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border-primary/20 bg-primary/5 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all">
          <div className="flex items-center gap-4">
            <Briefcase className="text-primary group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-white font-bold font-['Outfit']">Service Level Agreement (SLA)</p>
              <p className="text-slate-500 text-xs">Full legal text for enterprise partners</p>
            </div>
          </div>
          <CheckCircle className="text-slate-700 group-hover:text-primary transition-colors" />
        </div>
      </div>

      <div className="mt-20 py-10 border-t border-white/5 text-center">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
          Status: Operational // March 2026
        </p>
        <p className="text-slate-600 text-xs italic">
          Violations of this mandate are logged and indexed via blockchain ID.
        </p>
      </div>
    </div>
  </div>
);

const TermCard = ({ icon: Icon, title, desc }: any) => (
  <div className="glass p-8 rounded-[2rem] border-white/5 hover:border-blue-500/30 transition-all group">
    <Icon className="text-slate-600 group-hover:text-primary transition-colors mb-6" size={32} />
    <h3 className="text-xl font-bold text-white mb-3 font-['Outfit']">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Terms;

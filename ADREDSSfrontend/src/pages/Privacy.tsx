import React from 'react';
import { Shield, Lock, Eye, FileText, Database, Server, Smartphone, Globe } from 'lucide-react';

const Privacy: React.FC = () => (
  <div className="pt-28 min-h-screen bg-slate-950">
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
          <Shield size={14} />
          Digital Sovereignty
        </div>
        <h1 className="text-6xl font-[900] text-white mb-6 tracking-tighter font-['Outfit']">
          Privacy <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 italic">Architecture</span>
        </h1>
        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto">
          At ADREDSS, privacy is not a feature—it's the core substrate of our neural property network.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass p-10 rounded-[2rem] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-primary/10 transition-colors">
            <Database size={120} />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/20 p-4 rounded-2xl text-primary shadow-lg shadow-primary/20">
              <Lock size={28} />
            </div>
            <h2 className="text-3xl font-black text-white font-['Outfit']">Neural Anonymization</h2>
          </div>
          <div className="space-y-4 text-slate-400 leading-relaxed text-lg relative z-10">
            <p>
              Your search behavior and property preferences are processed through our **Privacy-Preserving Neural Gateway**. We use advanced differential privacy techniques to ensure that AI training models can learn from market trends without ever "remembering" your individual identity.
            </p>
            <p>
              Any data stored on our servers is encrypted at rest using AES-256 standards, with multi-sig access protocols reserved only for high-clearance system processes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-[2rem] border-white/5">
            <div className="bg-blue-400/20 w-12 h-12 flex items-center justify-center rounded-xl text-blue-400 mb-6">
              <Server size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Infrastructure Security</h3>
            <p className="text-slate-500 leading-relaxed">
              We host our ecosystem on decentralized cloud partitions across the Sindh region to ensure low-latency performance with high-redundancy failovers.
            </p>
          </div>

          <div className="glass p-8 rounded-[2rem] border-white/5">
            <div className="bg-cyan-400/20 w-12 h-12 flex items-center justify-center rounded-xl text-cyan-400 mb-6">
              <Smartphone size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Device Integrity</h3>
            <p className="text-slate-500 leading-relaxed">
              ADREDSS only requests permissions necessary for the experience: Bio-auth for secure login and location services for nearby verified listings.
            </p>
          </div>
        </div>

        <div className="glass p-10 rounded-[2rem] border-white/5">
          <div className="flex items-center gap-4 mb-8">
             <div className="bg-white/10 p-4 rounded-2xl text-white">
              <Globe size={28} />
            </div>
            <h2 className="text-3xl font-black text-white font-['Outfit']">Third-Party Protocol</h2>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            We **never sell your data**. Partner integrations (such as premium mortgage lenders or specialized legal consultants) only receive your information after you've explicitly triggered a "Verified Inquiry" or "Decision Support" request.
          </p>
          <div className="flex flex-wrap gap-2">
            {['GDPR Compliant', 'Neural Isolation', 'Zero-Knowledge Proofs', 'AES-256'].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center gap-6 border-t border-white/5 pt-12 text-center">
        <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
          <FileText size={14} className="text-primary" />
          Protocol Version 2.4.0_REV_MARCH_2026
        </div>
        <p className="text-slate-600 text-xs max-w-md">
          Continuous monitoring by ADREDSS Cyber-Intelligence Team. 
          For privacy clearance or data deletion requests, transmit via <a href="mailto:vault@adredss.ai" className="text-primary hover:text-white transition-colors">vault@adredss.ai</a>
        </p>
      </div>
    </div>
  </div>
);

export default Privacy;

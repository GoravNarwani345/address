import React from 'react';
import { CheckCircle, Sparkles, Shield, Cpu } from 'lucide-react';

const About: React.FC = () => (
  <div className="pt-28 min-h-screen bg-slate-950">
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6">The <span className="text-primary italic">ADREDSS</span> Vision</h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
          We're not just moving atoms; we're organizing intelligence to build the future of how humans dwell.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-6">Our DNA</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            ADREDSS was founded on the belief that real estate search shouldn't be a chore.
            By leveraging artificial intelligence, we connect discerning clients with properties
            that evolve with their lifestyle.
          </p>

          <div className="space-y-6">
            <ValueItem icon={Cpu} title="AI-First Strategy" desc="Our core engine uses neural networks to match properties based on 100+ behavioral data points." />
            <ValueItem icon={Shield} title="Identity Verification" desc="We use blockchain-grade protocols to verify every broker and listing on our platform." />
            <ValueItem icon={Sparkles} title="Innovation Loop" desc="We push code daily to ensure our users have access to the latest frontier in prop-tech." />
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-10 rounded-[2.5rem] border-primary/20 bg-primary/5 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6">Why ADREDSS?</h2>
            <ul className="space-y-4">
              <BenefitItem text="Proprietary AI matching algorithm" />
              <BenefitItem text="Real-time market analytics dashboard" />
              <BenefitItem text="Verified broker certification system" />
              <BenefitItem text="Immersive 4K property walkthroughs" />
              <BenefitItem text="Secure, end-to-end encrypted messaging" />
            </ul>
          </div>

          <div className="glass p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <h3 className="text-xl font-bold text-white mb-2">Our Reach</h3>
            <p className="text-slate-500 text-sm mb-6">Redefining real estate excellence across the region.</p>
            <div className="flex gap-12">
              <div>
                <p className="text-3xl font-black text-white">12k+</p>
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">450</p>
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Verified Brokers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ValueItem = ({ icon: Icon, title, desc }: any) => (
  <div className="flex gap-4 items-start">
    <div className="bg-primary/20 p-2 rounded-xl text-primary shrink-0">
      <Icon size={20} />
    </div>
    <div>
      <h3 className="font-bold text-white text-sm">{title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
    </div>
  </div>
)

const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
      <CheckCircle size={12} className="text-primary" />
    </div>
    <span className="text-slate-300 font-medium text-sm">{text}</span>
  </div>
)

export default About;

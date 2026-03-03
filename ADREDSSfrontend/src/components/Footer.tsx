import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => (
   <footer className="bg-slate-950 text-white border-t border-white/5 mt-auto">
     <div className="max-w-7xl mx-auto px-6 py-16">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 items-start text-center md:text-left">
         {/* Company Info */}
         <div className="space-y-6">
           <h3 className="text-4xl font-black text-primary italic">ADREDSS</h3>
           <p className="text-slate-400 leading-relaxed font-medium text-lg">
             AI-powered premium real estate ecosystem. We redefine how you discover, verify, and acquire properties in the modern age.
           </p>
         </div>

         {/* Quick Links */}
         <div className="flex flex-col items-center md:items-start">
           <h4 className="font-bold mb-6 text-white uppercase tracking-widest text-sm">Navigation</h4>
           <ul className="flex flex-col gap-4 text-slate-400 font-medium w-full md:w-auto items-center md:items-start">
             <li><Link to="/" className="hover:text-primary transition-colors">Intelligence Home</Link></li>
             <li><Link to="/listings" className="hover:text-primary transition-colors">Verified Listings</Link></li>
             <li><Link to="/dashboard" className="hover:text-primary transition-colors">Market Analysis</Link></li>
             <li><Link to="/about" className="hover:text-primary transition-colors">Our Vision</Link></li>
           </ul>
         </div>

         {/* Contact Details */}
         <div className="flex flex-col items-center md:items-start">
           <h4 className="font-bold mb-6 text-white uppercase tracking-widest text-sm text-center md:text-left w-full">Headquarters</h4>
           <ul className="flex flex-col gap-4 text-slate-400 font-medium w-full md:w-auto items-center md:items-start">
             <li className="flex items-center gap-2">
               <MapPin size={18} className="text-primary shrink-0" />
               <span>ADREDSS Plaza, Qasimabad, Hyderabad</span>
             </li>
             <li className="flex items-center gap-2">
               <Phone size={18} className="text-primary shrink-0" />
               <span>(+92) 21-34567890</span>
             </li>
             <li className="flex items-center gap-2">
               <Mail size={18} className="text-primary shrink-0" />
               <span>support@adredss.ai</span>
             </li>
           </ul>
        </div>
      </div>

      <div className="border-t border-white/5 pt-10 flex flex-col justify-center items-center gap-6 text-slate-500 text-xs font-bold tracking-widest uppercase">
        <p className="text-center">
          © {new Date().getFullYear()} ADREDSS Technologies. All rights reserved.
          <span className="block md:inline md:ml-2 text-primary">Developed by Aqsa & Anchal</span>
        </p>
        <div className="flex gap-8">
          <Link to="/privacy" className="hover:text-white transition-colors">Security Protocol</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

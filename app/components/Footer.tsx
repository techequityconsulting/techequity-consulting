// app/components/Footer.tsx
// Footer with company info

'use client';

import { Phone, Mail, MapPin } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';

export const Footer = () => {
  const { type: deviceType } = useDeviceDetection();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mobile Footer: Stacked layout
  const MobileFooter = () => (
    <footer className="bg-slate-950 text-white py-12 px-6 border-t border-slate-800">
      <div className="container mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <button 
            onClick={scrollToTop}
            className="inline-block bg-blue-950 border-2 border-blue-200 px-6 py-3 rounded hover:bg-blue-900 transition-colors"
          >
            <div className="text-center">
              <div className="text-white font-serif text-xl leading-tight">TechEquity</div>
              <div className="border-t border-blue-200 mt-1 mb-1"></div>
              <div className="text-white text-xs tracking-wide">Consulting</div>
            </div>
          </button>
        </div>

        {/* Contact Info - Stacked */}
        <div className="space-y-4 text-center mb-8">
          <a 
            href="tel:360-990-3610" 
            className="flex items-center justify-center gap-3 text-gray-300 hover:text-white transition-colors"
          >
            <Phone className="w-5 h-5 text-blue-400" />
            <span>360-990-3610</span>
          </a>
          
          <a 
            href="mailto:gabriel@techequityconsulting.com" 
            className="flex items-center justify-center gap-3 text-gray-300 hover:text-white transition-colors"
          >
            <Mail className="w-5 h-5 text-blue-400" />
            <span>gabriel@techequityconsulting.com</span>
          </a>
          
          <div className="flex items-center justify-center gap-3 text-gray-300">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span>Seattle, WA</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm pt-8 border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} TechEquity Consulting. All rights reserved.</p>
        <a 
            href="/admin" 
            className="text-gray-600 hover:text-gray-400 transition-colors text-xs mt-2 inline-block"
        >
            Admin
        </a>
        </div>
      </div>
    </footer>
  );

  // Tablet Footer: Two-column layout
  const TabletFooter = () => (
    <footer className="bg-slate-950 text-white py-12 px-8 border-t border-slate-800">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          {/* Logo */}
          <div>
            <button 
              onClick={scrollToTop}
              className="bg-blue-950 border-2 border-blue-200 px-8 py-3 rounded hover:bg-blue-900 transition-colors"
            >
              <div className="text-center">
                <div className="text-white font-serif text-2xl leading-tight">TechEquity</div>
                <div className="border-t border-blue-200 mt-1 mb-1"></div>
                <div className="text-white text-sm tracking-wide">Consulting</div>
              </div>
            </button>
          </div>

          {/* Contact Info - Horizontal */}
          <div className="flex flex-col gap-4">
            <a 
              href="tel:360-990-3610" 
              className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
            >
              <Phone className="w-5 h-5 text-blue-400" />
              <span>360-990-3610</span>
            </a>
            
            <a 
              href="mailto:gabriel@techequityconsulting.com" 
              className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
            >
              <Mail className="w-5 h-5 text-blue-400" />
              <span>gabriel@techequityconsulting.com</span>
            </a>
            
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>Seattle, WA</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm pt-8 border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} TechEquity Consulting. All rights reserved.</p>
        <a 
            href="/admin" 
            className="text-gray-600 hover:text-gray-400 transition-colors text-xs mt-2 inline-block"
        >
            Admin
        </a>
        </div>
      </div>
    </footer>
  );

  // Desktop Footer: Three-column layout
  const DesktopFooter = () => (
    <footer className="bg-slate-950 text-white py-16 px-16 border-t border-slate-800">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex justify-between items-start gap-12 mb-12">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <button 
              onClick={scrollToTop}
              className="bg-blue-950 border-2 border-blue-200 px-8 py-3 rounded hover:bg-blue-900 transition-colors group"
            >
              <div className="text-center">
                <div className="text-white font-serif text-2xl leading-tight group-hover:text-blue-200 transition-colors">TechEquity</div>
                <div className="border-t border-blue-200 mt-1 mb-1"></div>
                <div className="text-white text-sm tracking-wide group-hover:text-blue-200 transition-colors">Consulting</div>
              </div>
            </button>
            <p className="text-gray-400 text-sm mt-4 max-w-xs">
              Empowering businesses through technology excellence and cybersecurity solutions.
            </p>
          </div>

          {/* Contact Info Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Contact Information</h3>
            <div className="space-y-3">
              <a 
                href="tel:360-990-3610" 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <Phone className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <span>360-990-3610</span>
              </a>
              
              <a 
                href="mailto:gabriel@techequityconsulting.com" 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <Mail className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <span>gabriel@techequityconsulting.com</span>
              </a>
              
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Seattle, WA</span>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button 
                  onClick={scrollToServices}
                  className="hover:text-white transition-colors text-left"
                >
                  Operations Consulting
                </button>
              </li>
              <li>
                <button 
                  onClick={scrollToServices}
                  className="hover:text-white transition-colors text-left"
                >
                  Cybersecurity Solutions
                </button>
              </li>
              <li>
                <button 
                  onClick={scrollToServices}
                  className="hover:text-white transition-colors text-left"
                >
                  AI & Automation
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm pt-8 border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} TechEquity Consulting. All rights reserved.</p>
        <a 
            href="/admin" 
            className="text-gray-600 hover:text-gray-400 transition-colors text-xs mt-2 inline-block ml-4"
        >
            Admin
        </a>
        </div>
      </div>
    </footer>
  );

  return (
    <ResponsiveWrapper
      mobile={<MobileFooter />}
      tablet={<TabletFooter />}
      desktop={<DesktopFooter />}
    />
  );
};
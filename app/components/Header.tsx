// app/components/Header.tsx
// Modern navigation header - Complete rewrite with proper layout

'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { getTouchTargetSize } from '@/utils/deviceUtils';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Contact', id: 'contact' }
  ];

  // Mobile: Hamburger menu with slide-out drawer
  const MobileHeader = () => (
    <>
      <header className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <button 
              onClick={() => scrollToSection('home')}
              className="bg-blue-950 border-2 border-blue-200 px-4 py-2 rounded"
            >
              <div className="text-center">
                <div className="text-white font-serif text-lg leading-tight">TechEquity</div>
                <div className="border-t border-blue-200 mt-0.5 mb-0.5"></div>
                <div className="text-white text-[10px] tracking-wide">Consulting</div>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
              style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-40 pt-20">
          <nav className="container mx-auto px-6 py-8">
            <div className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-white text-xl py-4 px-4 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ minHeight: touchTargetSize }}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xl py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all mt-6"
                style={{ minHeight: touchTargetSize }}
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Mobile Spacer */}
      <div className="h-16"></div>
    </>
  );

  // Tablet: Compact horizontal nav
  const TabletHeader = () => (
    <>
      <header className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Tablet Logo */}
            <button 
              onClick={() => scrollToSection('home')}
              className="bg-blue-950 border-2 border-blue-200 px-6 py-2 rounded hover:bg-blue-900 transition-colors"
            >
              <div className="text-center">
                <div className="text-white font-serif text-xl leading-tight">TechEquity</div>
                <div className="border-t border-blue-200 mt-1 mb-1"></div>
                <div className="text-white text-xs tracking-wide">Consulting</div>
              </div>
            </button>

            {/* Tablet Navigation */}
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                  style={{ minHeight: touchTargetSize }}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => scrollToSection('contact')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all hover:scale-105 transform"
                style={{ minHeight: touchTargetSize }}
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Tablet Spacer */}
      <div className="h-16"></div>
    </>
  );

  // Desktop: Full width with 3-part layout (Logo | Nav | CTA)
  const DesktopHeader = () => (
    <>
      <header className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 z-50 shadow-lg">
        <div className="w-full px-16 py-4">
          <div className="flex items-center justify-between">
            {/* Desktop Logo - LEFT */}
            <button 
              onClick={() => scrollToSection('home')}
              className="bg-blue-950 border-2 border-blue-200 px-8 py-3 rounded hover:bg-blue-900 transition-colors group"
            >
              <div className="text-center">
                <div className="text-white font-serif text-2xl leading-tight group-hover:text-blue-200 transition-colors">TechEquity</div>
                <div className="border-t border-blue-200 mt-1 mb-1"></div>
                <div className="text-white text-sm tracking-wide group-hover:text-blue-200 transition-colors">Consulting</div>
              </div>
            </button>

            {/* Desktop Navigation - CENTER */}
            <nav className="flex items-center gap-12">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-300 hover:text-white transition-colors font-semibold text-xl relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </nav>

            {/* Desktop CTA Button - RIGHT */}
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all hover:scale-105 transform shadow-lg hover:shadow-blue-500/25 text-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Spacer */}
      <div className="h-20"></div>
    </>
  );

  return (
    <ResponsiveWrapper
      mobile={<MobileHeader />}
      tablet={<TabletHeader />}
      desktop={<DesktopHeader />}
    />
  );
};
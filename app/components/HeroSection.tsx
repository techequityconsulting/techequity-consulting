// app/components/HeroSection.tsx
// Final Design: Beautiful original styling + cleaned content (NO Gabriel in hero)

'use client';

import { ArrowRight } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { getTouchTargetSize, getFontSize, getSpacing } from '@/utils/deviceUtils';

export const HeroSection = () => {
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);
  const spacing = getSpacing(deviceType, 'lg');

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mobile: Vertical layout, larger touch targets, simplified text
  const MobileHeroSection = () => (
    <section className="bg-gradient-to-b from-slate-800 to-slate-900 text-white py-16 px-6">
      <div className="container mx-auto text-center">
        {/* Mobile Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          Seattle-Based Excellence
        </div>

        {/* Mobile Headline */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
          Empowering Business Through
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 block mt-2">
            Technology Excellence
          </span>
        </h1>
        
        {/* Mobile Description */}
        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Expert operations consulting and cybersecurity solutions that clear roadblocks and drive growth.
        </p>
        
        {/* Mobile CTA Button */}
        <button 
          onClick={scrollToContact}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 transform shadow-lg w-full max-w-sm active:scale-95 flex items-center justify-center gap-2 mx-auto"
          style={{ 
            minHeight: touchTargetSize,
            fontSize: getFontSize(deviceType, 'lg')
          }}
        >
          Schedule Consultation
          <ArrowRight className="w-5 h-5" />
        </button>
        
        {/* Mobile Key Benefits */}
        <div className="mt-12 grid grid-cols-1 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-blue-400 font-bold text-lg mb-1">Operations</div>
            <div className="text-gray-300 text-sm">CRM, HRIS, ERP deployment & integration</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-green-400 font-bold text-lg mb-1">Security</div>
            <div className="text-gray-300 text-sm">SOCs, SIEMs, penetration testing</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-purple-400 font-bold text-lg mb-1">AI Consulting</div>
            <div className="text-gray-300 text-sm">AI strategy & implementation guidance</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-cyan-400 font-bold text-lg mb-1">Growth</div>
            <div className="text-gray-300 text-sm">Scalable business transformations</div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 text-center max-w-sm mx-auto">
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-1">10+</div>
            <div className="text-sm text-gray-400">Years Experience</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-1">50+</div>
            <div className="text-sm text-gray-400">Projects Delivered</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-1">7</div>
            <div className="text-sm text-gray-400">Industries Served</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">100%</div>
            <div className="text-sm text-gray-400">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );

  // Tablet: Balanced layout
  const TabletHeroSection = () => (
    <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-20 px-8 relative overflow-hidden">
      {/* Tablet Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-transparent to-purple-950/20"></div>

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Tablet Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Seattle-Based Excellence
          </div>

          {/* Tablet Headline */}
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Empowering Business Through
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 block">
              Technology Excellence
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Over a decade of expertise in operations consulting and cybersecurity solutions. 
            Transforming organizations from startups to tribal governments.
          </p>

          {/* Tablet Feature Highlights */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-blue-400 font-bold text-lg">Operations</div>
              <div className="text-gray-300 text-sm">CRM, HRIS, ERP</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-green-400 font-bold text-lg">Security</div>
              <div className="text-gray-300 text-sm">SOCs, SIEMs</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-purple-400 font-bold text-lg">Growth</div>
              <div className="text-gray-300 text-sm">Scalable Systems</div>
            </div>
          </div>
          
          {/* Tablet CTA */}
          <button 
            onClick={scrollToContact}
            className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 transform"
            style={{ minHeight: touchTargetSize }}
          >
            <span className="flex items-center gap-2 justify-center">
              Schedule Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Tablet Stats */}
          <div className="mt-12 grid grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">10+</div>
              <div className="text-sm text-gray-400">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-1">50+</div>
              <div className="text-sm text-gray-400">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-1">7</div>
              <div className="text-sm text-gray-400">Industries Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-1">100%</div>
              <div className="text-sm text-gray-400">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Desktop: Full centered layout with grid background
  const DesktopHeroSection = () => (
    <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-24 relative overflow-hidden min-h-[700px] flex items-center">
      {/* Desktop Background Grid - Original beautiful design */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-transparent to-purple-950/20"></div>
      
      <div className="w-full px-16 relative z-10">
        <div className="max-w-[1400px] mx-auto text-center">
          {/* Desktop Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Seattle-Based Excellence
          </div>

          {/* Desktop Headline */}
          <h1 className="text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Empowering Business Through
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 block animate-pulse">
              Technology Excellence
            </span>
          </h1>
          
          <p className="text-2xl text-gray-300 mb-8 max-w-5xl mx-auto leading-relaxed">
            Over a decade of expertise in operations consulting and cybersecurity solutions. 
            Transforming organizations from startups to tribal governments with proven methodologies 
            and cutting-edge technology implementations.
          </p>

          {/* Desktop Feature Highlights */}
          <div className="grid grid-cols-4 gap-8 mb-10 max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-blue-400 font-bold text-xl mb-2">Operations</div>
              <div className="text-gray-300">CRM, HRIS, ERP Solutions</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-green-400 font-bold text-xl mb-2">Security</div>
              <div className="text-gray-300">SOCs, SIEMs, Compliance</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-purple-400 font-bold text-xl mb-2">AI Consulting</div>
              <div className="text-gray-300">Strategy & Implementation</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-cyan-400 font-bold text-xl mb-2">Growth</div>
              <div className="text-gray-300">Scalable Transformations</div>
            </div>
          </div>
          
          {/* Desktop CTA */}
          <div className="mb-16">
            <p className="text-gray-300 text-lg mb-4">Ready to transform your operations?</p>
            <button 
              onClick={scrollToContact}
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-6 rounded-xl text-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-blue-500/50 hover:scale-105 transform"
            >
              <span className="flex items-center gap-3 justify-center">
                Schedule a Discovery Call
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Desktop Trust Indicators */}
          <div className="grid grid-cols-4 gap-12 text-center mt-16 max-w-6xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">10+</div>
              <div className="text-sm text-gray-400">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-sm text-gray-400">Projects Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">7</div>
              <div className="text-sm text-gray-400">Industries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">100%</div>
              <div className="text-sm text-gray-400">Client Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Desktop Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );

  return (
    <ResponsiveWrapper
      mobile={<MobileHeroSection />}
      tablet={<TabletHeroSection />}
      desktop={<DesktopHeroSection />}
    />
  );
};
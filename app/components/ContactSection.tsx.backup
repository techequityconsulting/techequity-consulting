// src/app/techequity-demo/components/ContactSection.tsx

'use client';

import { MessageSquare, Calendar, ArrowRight, Bot } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { getTouchTargetSize } from '@/utils/deviceUtils';

export const ContactSection = () => {
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);

  // Placeholder function for scheduling (to be implemented with AutoAssistPro)
  const handleScheduleClick = () => {
    // TODO: Open AutoAssistPro scheduling modal
    console.log('Schedule Discovery Call clicked - To be implemented with AutoAssistPro');
  };

  // Mobile: Simple centered layout
  const MobileContactSection = () => (
    <section id="contact" className="py-16 bg-slate-900 text-white px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30">
            <MessageSquare className="w-4 h-4" />
            Ready to Get Started?
          </div>
          <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Ready to transform your operations? Let&apos;s discuss how we can help.
          </p>
        </div>

        {/* Mobile Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <Calendar className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Schedule Your Discovery Call</h3>
            <p className="text-lg text-blue-100 mb-6">
              15-minute complimentary discovery call to understand your challenges and explore how we can help.
            </p>
            
            <button 
              onClick={handleScheduleClick}
              className="w-full bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 transform shadow-lg mb-6 active:scale-95"
              style={{ minHeight: touchTargetSize }}
            >
              Schedule Discovery Call
            </button>

            {/* Service Badges */}
            <div className="space-y-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Bot className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Instant Answers</h4>
                <p className="text-blue-100 text-sm">Chat with our AI assistant for immediate help</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Calendar className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Free Discovery Call</h4>
                <p className="text-blue-100 text-sm">15-minute consultation to explore solutions</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <ArrowRight className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Proven Results</h4>
                <p className="text-blue-100 text-sm">10+ years of measurable outcomes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Tablet: Two-column layout
  const TabletContactSection = () => (
    <section id="contact" className="py-20 bg-slate-900 text-white px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30">
            <MessageSquare className="w-4 h-4" />
            Ready to Get Started?
          </div>
          <h2 className="text-4xl font-bold mb-4">Get Started Today</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your operations and strengthen your cybersecurity? 
            Let&apos;s discuss how TechEquity Consulting can support your goals.
          </p>
        </div>

        {/* Tablet Featured CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <Calendar className="w-14 h-14 text-white mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Schedule Your Discovery Call</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              15-minute complimentary discovery call to understand your challenges, 
              explore solutions, and determine if TechEquity is the right fit.
            </p>
            
            <div className="flex justify-center mb-8">
              <button 
                onClick={handleScheduleClick}
                className="bg-white text-blue-600 px-10 py-5 rounded-xl text-xl font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 transform shadow-xl"
                style={{ minHeight: touchTargetSize }}
              >
                Schedule Discovery Call
              </button>
            </div>

            {/* Service Guarantees */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Bot className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Instant Answers</h4>
                <p className="text-blue-100 text-sm">Chat with our AI assistant now</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Calendar className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Free Discovery Call</h4>
                <p className="text-blue-100 text-sm">15-minute consultation available</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <ArrowRight className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Proven Results</h4>
                <p className="text-blue-100 text-sm">10+ years experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Desktop: Full width featured section
  const DesktopContactSection = () => (
    <section id="contact" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Desktop Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-transparent to-purple-950/20"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30">
            <MessageSquare className="w-4 h-4" />
            Ready to Get Started?
          </div>
          <h2 className="text-4xl font-bold mb-4">Get Started Today</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your operations and strengthen your cybersecurity? 
            Let&apos;s discuss how TechEquity Consulting can support your goals.
          </p>
        </div>

        {/* Desktop Featured CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <Calendar className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Schedule Your Discovery Call</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              15-minute complimentary discovery call to understand your challenges, 
              explore solutions, and determine if TechEquity is the right fit for your organization.
            </p>
            
            <div className="flex justify-center mb-8">
              <button 
                onClick={handleScheduleClick}
                className="bg-white text-blue-600 px-12 py-5 rounded-xl text-xl font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 transform shadow-xl"
              >
                Schedule Discovery Call
              </button>
            </div>

            {/* Desktop Service Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Bot className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Instant Answers</h4>
                <p className="text-blue-100 text-sm">Chat with our AI assistant for immediate help</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Calendar className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Free Discovery Call</h4>
                <p className="text-blue-100 text-sm">15-minute consultation to explore solutions</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <ArrowRight className="w-6 h-6 text-white mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Proven Results</h4>
                <p className="text-blue-100 text-sm">10+ years of measurable outcomes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <ResponsiveWrapper
      mobile={<MobileContactSection />}
      tablet={<TabletContactSection />}
      desktop={<DesktopContactSection />}
    />
  );
};
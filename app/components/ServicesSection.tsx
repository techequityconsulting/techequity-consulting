// src/app/techequity-demo/components/ServicesSection.tsx

'use client';

import { Building2, Shield, Bot } from 'lucide-react';
import Image from 'next/image';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { getTouchTargetSize } from '@/utils/deviceUtils';
import { useState } from 'react';

export const ServicesSection = () => {
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);

  // Tab state - default to Operations
  const [activeTab, setActiveTab] = useState<'operations' | 'security' | 'ai'>('operations');

  const tabs = [
    {
      id: 'operations' as const,
      label: 'Operations',
      icon: Building2,
      color: 'blue'
    },
    {
      id: 'security' as const,
      label: 'Security',
      icon: Shield,
      color: 'green'
    },
    {
      id: 'ai' as const,
      label: 'AI & Automation',
      icon: Bot,
      color: 'purple'
    }
  ];

  const tabContent = {
    operations: {
      title: 'Operations',
      description: 'Below is a list of some of the tools we have helped deploy',
      image: '/images/operations-team.jpg',
      imageAlt: 'Fostering effective cross-team collaboration and growth',
      items: [
        { label: 'CRMs', description: '(customer relationship management)' },
        { label: 'Project Management Tools', description: '' },
        { label: 'HRIS', description: 'platforms (human resources information systems)' },
        { label: 'Enterprise Databases', description: '' },
        { label: 'ERPs', description: '(enterprise resource planning)' },
        { label: 'EMS solutions', description: '(environmental management systems)' },
        { label: 'Collaboration & Communication Platforms', description: '(Microsoft 365, Google Workspace, Slack, Teams)' },
        { label: 'Document/Content Management Systems', description: '(DMS/CMS) (SharePoint, Confluence, WordPress for operations websites)' },
        { label: 'Learning Management Systems', description: '(LMS) (employee training & compliance tracking)' }
      ]
    },
    security: {
      title: 'Security',
      description: 'Below is a list of some of the tools we have helped deploy',
      image: '/images/security-datacenter.jpg',
      imageAlt: 'Safeguarding data, protecting the future',
      items: [
        { label: 'SOCs', description: '(security operations centers) and SIEMs (security information & event management)' },
        { label: 'Endpoint security platforms', description: '' },
        { label: 'Penetration Testing-as-a-Service', description: '(PaaS)' },
        { label: 'Vulnerability assessments & gap analysis', description: '' },
        { label: 'Governance, Risk & Compliance', description: '(GRC) project management' },
        { label: 'CMMC compliance readiness', description: '' }
      ]
    },
    ai: {
      title: 'AI & Automation',
      description: 'Transforming businesses with intelligent automation and AI-powered solutions',
      image: '/images/ai-automation.jpg',
      imageAlt: 'AI-powered automation and intelligent solutions',
      items: [
        { label: 'AI Strategy Consulting', description: '(roadmap development, use case identification)' },
        { label: 'AI Transformation Partner', description: '(end-to-end implementation and integration)' },
        { label: 'Process Automation', description: '(workflow optimization, RPA implementation)' },
        { label: 'Customer Service Chatbots', description: '(24/7 intelligent support automation)' },
        { label: 'AI-Powered Analytics', description: '(predictive insights, data intelligence)' },
        { label: 'Custom AI Solutions', description: '(tailored ML models, NLP applications)' },
        { label: 'AI Training & Change Management', description: '(team enablement, adoption strategies)' }
      ]
    }
  };

  // Mobile: Tabs + Content with image below
  const MobileServicesSection = () => {
    const content = tabContent[activeTab];
    const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || Building2;

    return (
      <section id="services" className="py-16 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 relative overflow-hidden px-6">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">Our Services</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              Comprehensive technology solutions to unlock growth and strengthen security
            </p>
          </div>

          {/* Mobile Tab Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full p-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-slate-200 text-slate-800 border-2 border-slate-300 hover:border-blue-400 hover:bg-slate-300'
                  }`}
                  style={{ minHeight: touchTargetSize }}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Tab Content */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <ActiveIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{content.title}</h3>
            </div>
            
            <p className="text-gray-700 text-lg mb-6 leading-relaxed text-center font-medium italic">{content.description}</p>

            {/* Services List */}
            <div className="space-y-3 mb-6">
              {content.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold text-slate-900">{item.label}</span>
                    {item.description && <span className="text-gray-600"> {item.description}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Image */}
            <div className="w-full h-64 rounded-lg overflow-hidden relative shadow-lg">
              <Image
                src={content.image}
                alt={content.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Tablet: Horizontal tabs + two-column layout (list + image)
  const TabletServicesSection = () => {
    const content = tabContent[activeTab];
    const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || Building2;

    return (
      <section id="services" className="py-20 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 relative overflow-hidden px-8">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">Our Services</h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              Comprehensive technology solutions to unlock growth and strengthen security
            </p>
          </div>

          {/* Tablet Tab Buttons - Horizontal */}
          <div className="flex gap-4 mb-12 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                      : 'bg-slate-200 text-slate-800 border-2 border-slate-300 hover:border-blue-400 hover:bg-slate-300 hover:scale-105'
                  }`}
                  style={{ minHeight: touchTargetSize }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tablet Tab Content - Two Columns */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left Column - Services List */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <ActiveIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">{content.title}</h3>
                </div>
                
                <p className="text-gray-700 text-lg mb-6 leading-relaxed text-center font-medium italic">{content.description}</p>

                {/* Services List */}
                <div className="space-y-3">
                  {content.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-slate-900">{item.label}</span>
                        {item.description && <span className="text-gray-600"> {item.description}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="flex flex-col justify-center">
                <div className="w-full h-96 rounded-xl overflow-hidden relative shadow-xl">
                  <Image
                    src={content.image}
                    alt={content.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 600px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Desktop: Horizontal tabs + two-column layout (list + larger image)
  const DesktopServicesSection = () => {
    const content = tabContent[activeTab];
    const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || Building2;

    return (
      <section id="services" className="py-20 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 relative overflow-hidden">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-bold text-slate-900 mb-6 tracking-tight">Our Services</h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              Comprehensive technology solutions to unlock growth and strengthen security
            </p>
          </div>

          {/* Desktop Tab Buttons - Centered Horizontal */}
          <div className="flex gap-6 mb-16 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 rounded-xl font-semibold text-xl transition-all duration-300 flex items-center gap-3 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl transform scale-110'
                      : 'bg-slate-200 text-slate-800 border-2 border-slate-300 hover:border-blue-400 hover:bg-slate-300 hover:scale-105 hover:shadow-lg'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Tab Content - Two Columns with Border */}
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-blue-600 overflow-hidden">
            {/* Blue Header Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-12 py-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ActiveIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-white">{content.title}</h3>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-12">
              <p className="text-gray-700 text-xl mb-8 leading-relaxed text-center font-medium italic">{content.description}</p>

              <div className="grid grid-cols-2 gap-12 items-start">
                {/* Left Column - Services List */}
                <div>
                  <div className="space-y-4">
                    {content.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 group">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0 group-hover:bg-blue-600 transition-colors"></div>
                        <div>
                          <span className="font-semibold text-slate-900 text-lg">{item.label}</span>
                          {item.description && <span className="text-gray-600"> {item.description}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Image */}
                <div className="flex flex-col justify-center">
                  <div className="w-full h-[500px] rounded-2xl overflow-hidden relative shadow-2xl border-4 border-blue-100">
                    <Image
                      src={content.image}
                      alt={content.imageAlt}
                      fill
                      className="object-cover"
                      sizes="50vw"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Bottom CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Operations?</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Let&apos;s discuss how our proven methodologies can address your specific challenges and drive measurable results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 transform shadow-lg">
                  Schedule Discovery Call
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm">
                  Download Service Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <ResponsiveWrapper
      mobile={<MobileServicesSection />}
      tablet={<TabletServicesSection />}
      desktop={<DesktopServicesSection />}
    />
  );
};
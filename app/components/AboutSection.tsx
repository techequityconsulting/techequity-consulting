// app/components/AboutSection.tsx
// Complete redesign with larger Seattle image and better balanced layout

'use client';

import Image from 'next/image';
import { Award, Globe } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';

export const AboutSection = () => {
  const { type: deviceType } = useDeviceDetection();

  // Mobile Layout
  const MobileAboutSection = () => (
    <section id="about" className="py-16 px-6 bg-gradient-to-br from-gray-200 via-slate-200 to-gray-200 relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Company Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About TechEquity Consulting</h2>
          
          {/* Seattle Image - Mobile */}
          <div className="mb-8">
            <div className="w-full h-80 rounded-xl shadow-lg overflow-hidden relative">
              <Image
                src="/images/seattle-skyline.jpg"
                alt="Seattle skyline with Space Needle"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
            <p className="text-base text-gray-500 italic mt-4 text-center">
              Based in Seattle, TechEquity Consulting has over a decade of experience transforming West Coast organizations.
            </p>
          </div>
          
          <div className="space-y-5">
            <p className="text-lg text-slate-800 leading-relaxed text-justify">
              At TechEquity Consulting, we help organizations unlock growth by clearing operational roadblocks and strengthening cybersecurity. Based in Seattle, we bring over a decade of experience transforming organizations from startups to tribal governments and enterprise clients.
            </p>
            <p className="text-lg text-slate-800 leading-relaxed text-justify">
              Our expertise spans operations optimization, cybersecurity implementation, strategic technology planning, and comprehensive AI services including automation, strategic consultation, and custom chatbot solutions.
            </p>
            <p className="text-lg text-slate-800 leading-relaxed text-justify">
              From deploying enterprise systems to building cybersecurity programs from the ground up, we deliver solutions that drive sustainable, data-driven growth.
            </p>
          </div>
        </div>

        {/* Gabriel Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-xl">
          {/* Gabriel's Photo */}
          <div className="w-full h-96 rounded-xl mb-6 shadow-lg overflow-hidden relative">
            <Image
              src="/images/gabriel-cook.jpg"
              alt="Gabriel Cook, Founder of TechEquity Consulting"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Gabriel Cook</h3>
          <p className="text-blue-600 font-semibold text-lg mb-4">Founder & Principal Consultant</p>
          
          <p className="text-slate-800 leading-relaxed mb-6 text-justify">
            Gabriel Cook founded TechEquity Consulting with over a decade of experience in operations and cybersecurity consulting. He specializes in helping organizations overcome operational challenges and strengthen their security posture across diverse industries.
          </p>

          {/* Achievements */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Suquamish Tribe Transformation
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Led comprehensive digital transformation including ERP implementation, cybersecurity enhancement, and operational optimization across 8+ departments.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium">40% efficiency ↑</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium">$2M savings</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium">Zero incidents</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-600" />
                Pacific Northwest Tribal Technology Group
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Co-founded and led regional consortium providing shared cybersecurity, cloud infrastructure, and governance solutions serving 15+ tribal organizations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-medium">15+ organizations</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-medium">Regional impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Tablet Layout
  const TabletAboutSection = () => (
    <section id="about" className="py-20 px-8 bg-gradient-to-br from-gray-200 via-slate-200 to-gray-200 relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Company Overview with Seattle Image */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">About TechEquity Consulting</h2>
          
          <div className="flex flex-col md:flex-row gap-10 items-stretch">
            {/* Text Content - Now using flex-1 for equal space */}
            <div className="flex-1 flex flex-col justify-between space-y-8">
              <p className="text-lg text-slate-800 leading-relaxed text-justify">
                At TechEquity Consulting, we help organizations unlock growth by clearing operational roadblocks and strengthening cybersecurity. Based in Seattle, we bring over a decade of experience transforming organizations from startups to tribal governments and enterprise clients across diverse industries.
              </p>
              <p className="text-lg text-slate-800 leading-relaxed text-justify">
                We work across industries to streamline workflows, deploy business-critical systems, and build scalable, efficient operations. Our expertise spans operations optimization, cybersecurity implementation, strategic technology planning, and comprehensive AI services including automation, strategic consultation, and custom chatbot solutions.
              </p>
              <p className="text-lg text-slate-800 leading-relaxed text-justify">
                From deploying enterprise resource planning systems to building cybersecurity programs from the ground up, we deliver solutions that recover losses, tighten profit margins, and equip organizations for sustainable, data-driven growth.
              </p>
            </div>
            
            {/* Seattle Image - Tablet - Larger and matches text height */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 rounded-xl shadow-xl overflow-hidden relative min-h-[500px]">
                <Image
                  src="/images/seattle-skyline.jpg"
                  alt="Seattle skyline with Space Needle"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 600px"
                />
              </div>
              <p className="text-base text-gray-500 italic mt-4">
                Based in Seattle, TechEquity Consulting has over a decade of experience transforming West Coast organizations.
              </p>
            </div>
          </div>
        </div>

        {/* Gabriel Card */}
        <div className="bg-white rounded-2xl p-8 border border-slate-300 shadow-xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Gabriel's Photo */}
            <div className="w-full md:w-72 h-96 rounded-xl shadow-lg overflow-hidden relative flex-shrink-0">
              <Image
                src="/images/gabriel-cook.jpg"
                alt="Gabriel Cook, Founder of TechEquity Consulting"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Gabriel Cook</h3>
              <p className="text-blue-600 font-semibold text-xl mb-4">Founder & Principal Consultant</p>
              
              <p className="text-slate-800 leading-relaxed mb-6 text-justify">
                Gabriel Cook founded TechEquity Consulting with over a decade of experience in operations and cybersecurity consulting. He specializes in helping organizations overcome operational challenges and strengthen their security posture across diverse industries.
              </p>

              {/* Achievements - Stacked */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Suquamish Tribe Transformation
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Led comprehensive digital transformation including ERP implementation, cybersecurity enhancement, and operational optimization across 8+ departments.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">40% efficiency ↑</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">$2M savings</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Zero incidents</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-600" />
                    Pacific Northwest Tribal Technology Group
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Co-founded and led regional consortium providing shared cybersecurity, cloud infrastructure, and governance solutions serving 15+ tribal organizations throughout the Northwest.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">15+ organizations</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Regional leadership</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Desktop Layout - Completely Redesigned
  const DesktopAboutSection = () => (
    <section id="about" className="py-24 px-16 bg-gradient-to-br from-gray-200 via-slate-200 to-gray-200 relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="w-full max-w-[1400px] mx-auto relative z-10">
        {/* Company Overview with Larger Seattle Image */}
        <div className="mb-20">
          <h2 className="text-5xl font-bold text-slate-900 mb-10 text-center">About TechEquity Consulting</h2>
          
          <div className="flex gap-12 items-stretch">
            {/* Text Content - Equal flex space */}
            <div className="flex-1 flex flex-col justify-between">
              <p className="text-2xl text-slate-800 leading-relaxed text-justify mb-6">
                At TechEquity Consulting, we help organizations unlock growth by clearing operational roadblocks and strengthening cybersecurity. Based in Seattle, we bring over a decade of experience transforming organizations from startups to tribal governments and enterprise clients across diverse industries.
              </p>
              <p className="text-2xl text-slate-800 leading-relaxed text-justify mb-6">
                We work across industries to streamline workflows, deploy business-critical systems, and build scalable, efficient operations. Our expertise spans operations optimization, cybersecurity implementation, strategic technology planning, and comprehensive AI services including automation, strategic consultation, and custom chatbot solutions.
              </p>
              <p className="text-2xl text-slate-800 leading-relaxed text-justify">
                From deploying enterprise resource planning systems to building cybersecurity programs from the ground up, we deliver solutions that recover losses, tighten profit margins, and equip organizations for sustainable, data-driven growth.
              </p>
            </div>
            
            {/* Seattle Image - Desktop - Much Larger! */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 rounded-2xl shadow-2xl overflow-hidden relative min-h-[550px]">
                <Image
                  src="/images/seattle-skyline.jpg"
                  alt="Seattle skyline with Space Needle and Mount Rainier"
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
              </div>
              <p className="text-lg text-gray-500 italic mt-5 text-center">
                Based in Seattle, TechEquity Consulting has over a decade of experience transforming West Coast organizations.
              </p>
            </div>
          </div>
        </div>

        {/* Gabriel Card */}
        <div className="bg-white rounded-3xl p-12 border border-slate-300 shadow-2xl">
          <div className="flex gap-12">
            {/* Gabriel's Photo */}
            <div className="w-96 h-[500px] rounded-2xl shadow-xl overflow-hidden relative flex-shrink-0">
              <Image
                src="/images/gabriel-cook.jpg"
                alt="Gabriel Cook, Founder of TechEquity Consulting"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-4xl font-bold text-slate-900 mb-3">Gabriel Cook</h3>
              <p className="text-blue-600 font-semibold text-2xl mb-6">Founder & Principal Consultant</p>
              
              <p className="text-xl text-slate-800 leading-relaxed mb-8 text-justify">
                Gabriel Cook founded TechEquity Consulting with over a decade of experience in operations and cybersecurity consulting. He specializes in helping organizations overcome operational challenges and strengthen their security posture across diverse industries including tribal governments, startups, manufacturing, banking, hospitality, and construction.
              </p>

              {/* Achievements - Two Columns */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-xl text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-7 h-7 text-blue-600" />
                    Suquamish Tribe Transformation
                  </h4>
                  <p className="text-base text-gray-600 mb-5 leading-relaxed">
                    Led comprehensive digital transformation including ERP implementation, cybersecurity enhancement, and operational optimization across 8+ departments while honoring tribal data sovereignty.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-base font-medium">40% efficiency ↑</span>
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-base font-medium">$2M+ savings</span>
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-base font-medium">Zero incidents</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-xl text-slate-900 mb-4 flex items-center gap-2">
                    <Globe className="w-7 h-7 text-cyan-600" />
                    Pacific Northwest Tribal Technology Group
                  </h4>
                  <p className="text-base text-gray-600 mb-5 leading-relaxed">
                    Co-founded and led regional consortium providing shared cybersecurity, cloud infrastructure, and digital governance solutions serving 15+ tribal organizations throughout the Northwest.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-base font-medium">15+ organizations</span>
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-base font-medium">Regional leadership</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <ResponsiveWrapper
      mobile={<MobileAboutSection />}
      tablet={<TabletAboutSection />}
      desktop={<DesktopAboutSection />}
    />
  );
};
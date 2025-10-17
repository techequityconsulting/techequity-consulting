// app/components/TrustedPartnersSection.tsx
// Social proof section with partner logos - Darker card backgrounds for better contrast

'use client';

import Image from 'next/image';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';

export const TrustedPartnersSection = () => {
  const { type: deviceType } = useDeviceDetection();

  const partners = [
    { name: 'Tribal-D', image: '/images/partners/tribal-d.png' },
    { name: 'Evolve Security', image: '/images/partners/evolve-security.svg' },
    { name: 'NexOne', image: '/images/partners/nexone.png' },
    { name: 'Collective Exec', image: '/images/partners/collective-exec.png' }
  ];

  // Mobile: Stack logos in 2x2 grid
  const MobileTrustedPartnersSection = () => (
    <section className="py-12 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Trusted Partners</h2>
          <p className="text-gray-300">Collaborating with industry leaders to deliver excellence</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-lg p-6 flex items-center justify-center border-2 border-slate-600 shadow-xl hover:shadow-2xl hover:bg-slate-700 transition-all"
              style={{ minHeight: '140px' }}
            >
              <div className="text-center">
                <div className="w-full h-20 relative mb-3 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={partner.image}
                      alt={`${partner.name} logo`}
                      fill
                      className="object-contain drop-shadow-xl brightness-110"
                      sizes="150px"
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-300 font-medium">{partner.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs">
            and many more organizations across the Pacific Northwest
          </p>
        </div>
      </div>
    </section>
  );

  // Tablet: All 4 logos in a single row
  const TabletTrustedPartnersSection = () => (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Trusted Partners</h2>
          <p className="text-lg text-gray-300">Collaborating with industry leaders to deliver excellence</p>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-xl p-6 flex flex-col items-center justify-center border-2 border-slate-600 shadow-xl hover:shadow-2xl hover:bg-slate-700 hover:border-slate-500 transition-all hover:scale-105 transform"
              style={{ minHeight: '180px' }}
            >
              <div className="w-full h-28 relative mb-4 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={partner.image}
                    alt={`${partner.name} logo`}
                    fill
                    className="object-contain drop-shadow-xl brightness-110"
                    sizes="200px"
                  />
                </div>
              </div>
              <span className="text-sm text-gray-300 font-medium text-center">{partner.name}</span>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            and many more organizations across the Pacific Northwest
          </p>
        </div>
      </div>
    </section>
  );

  // Desktop: Horizontal layout with larger logos
  const DesktopTrustedPartnersSection = () => (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Grid Pattern - Consistent with other sections */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-16 relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">Trusted Partners</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Collaborating with industry leaders to deliver excellence
          </p>
        </div>
        
        <div className="grid grid-cols-4 gap-8 max-w-6xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-slate-600 shadow-2xl hover:shadow-3xl hover:bg-slate-700 hover:border-slate-500 transition-all hover:scale-105 transform group"
              style={{ minHeight: '220px' }}
            >
              {/* Logo */}
              <div className="w-full h-36 relative mb-5 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={partner.image}
                    alt={`${partner.name} logo`}
                    fill
                    className="object-contain drop-shadow-2xl brightness-110 group-hover:brightness-125 transition-all"
                    sizes="300px"
                  />
                </div>
              </div>
              <span className="text-base text-gray-200 font-semibold text-center">{partner.name}</span>
            </div>
          ))}
        </div>

        {/* Optional: Additional trust indicator */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            and many more organizations across the Pacific Northwest
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <ResponsiveWrapper
      mobile={<MobileTrustedPartnersSection />}
      tablet={<TabletTrustedPartnersSection />}
      desktop={<DesktopTrustedPartnersSection />}
    />
  );
};
import React, { useState } from 'react';
import { Clock, Shield, Sparkles, Check, AlertCircle, Calendar, ArrowRight, Car } from 'lucide-react';
import { ServiceItem, VehicleCategory } from '../types';
import { VEHICLE_CATEGORIES } from '../lib/defaultData';

interface ServicesGridProps {
  services: ServiceItem[];
  onSelectServiceToBook: (service: ServiceItem, category: VehicleCategory) => void;
  onOpenEstimator: () => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  services,
  onSelectServiceToBook,
  onOpenEstimator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleCategory>('Sedan');

  const categories = ['All', 'Washing', 'Detailing', 'Ceramic & Graphene', 'Paint Protection Film (PPF)', 'Restoration'];

  const filteredServices = services.filter((s) => {
    if (!s.isActive) return false;
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  return (
    <section id="services" className="py-20 bg-zinc-950 relative border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Precision Detailing Packages
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            Tailored Engineering for Every Vehicle Class
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Prices calibrated transparently by vehicle segment. Select your car category to view accurate package estimates.
          </p>
        </div>

        {/* Vehicle Category Selector Bar */}
        <div className="mt-10 p-2 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-4xl mx-auto">
          <div className="flex items-center justify-between px-3 py-1 text-xs text-zinc-400 border-b border-zinc-800/80 mb-2">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Car className="w-4 h-4 text-amber-400" /> Select Your Vehicle Category for Exact Pricing:
            </span>
            <button
              onClick={onOpenEstimator}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer hidden sm:block"
            >
              Open Full Estimator →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {VEHICLE_CATEGORIES.map((vc) => {
              const isSelected = selectedVehicleType === vc.category;
              return (
                <button
                  key={vc.category}
                  onClick={() => setSelectedVehicleType(vc.category)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20'
                      : 'bg-zinc-950 hover:bg-zinc-800/80 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  <div className="text-xs font-semibold leading-tight">{vc.category}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-zinc-800' : 'text-zinc-500'}`}>
                    {vc.examples}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const priceForVehicle = service.categoryPricing?.[selectedVehicleType] || service.startingPrice;

            return (
              <div
                key={service.id}
                className="group relative rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-xl hover:shadow-amber-500/5"
              >
                {/* Popular Tag Header */}
                {service.popularTag && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-zinc-950 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
                    {service.popularTag}
                  </div>
                )}

                <div className="p-6">
                  {/* Category & Duration */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium border border-zinc-700/60">
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {service.durationMinutes} mins
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Dynamic Pricing Box */}
                  <div className="mt-4 p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-zinc-400">
                        Price for <span className="text-amber-400 font-medium">{selectedVehicleType}</span>:
                      </span>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-white font-mono">
                          ₹{priceForVehicle.toLocaleString('en-IN')}
                        </span>
                        {service.inspectionRequired && (
                          <span className="block text-[10px] text-amber-400/90 font-medium">
                            Starting / Inspection Req.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inspection Notice */}
                  {service.inspectionRequired && (
                    <div className="mt-3 flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>In-studio paint depth measurement conducted to verify clear coat health.</span>
                    </div>
                  )}

                  {/* Feature Checkpoints */}
                  <div className="mt-4 space-y-2 border-t border-zinc-800/80 pt-4">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                      Treatment Inclusions:
                    </span>
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Card */}
                <div className="p-6 pt-0 border-t border-zinc-800/60 mt-4">
                  <div className="pt-4 flex items-center gap-2">
                    <button
                      onClick={() => onSelectServiceToBook(service, selectedVehicleType)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book for ₹{priceForVehicle.toLocaleString('en-IN')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Shield, Sparkles, Calendar, Calculator, CheckCircle2, Award, Zap, ChevronRight } from 'lucide-react';
import { BusinessSettings } from '../types';

interface HeroSectionProps {
  settings: BusinessSettings;
  onOpenBooking: () => void;
  onOpenEstimator: () => void;
  onOpenChat: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onOpenBooking,
  onOpenEstimator,
  onOpenChat,
}) => {
  return (
    <section className="relative overflow-hidden bg-zinc-950 pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-zinc-800">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-32 right-0 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Bangalore's Premier Clean-Room Detailing Facility</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Flawless Reflections. <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                Nanotechnology
              </span>{' '}
              Paint Armor.
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              Experience laboratory-grade automotive restoration in {settings.cityAndServiceArea}. From 2-stage multi-micron paint correction to 10H graphene matrix coatings and self-healing TPU PPF.
            </p>

            {/* Quick feature checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-zinc-300 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>95% Swirl Eradication</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Certified 10H Graphene</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Dust-Free Curing Bays</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Digital Paint Depth Calibrated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Up to 7-Yr Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Transparent ₹ Estimates</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Reserve Detailing Slot
              </button>

              <button
                onClick={onOpenEstimator}
                className="px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-700 hover:border-zinc-600 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                Calculate Price Estimate
              </button>

              <button
                onClick={onOpenChat}
                className="px-4 py-3.5 rounded-xl text-zinc-400 hover:text-amber-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask AI Detailing Specialist</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 shadow-2xl shadow-black/80">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                    Today's Studio Status
                  </span>
                </div>
                <span className="text-xs text-zinc-400">Slots Open Today</span>
              </div>

              {/* Package Highlight Teaser */}
              <div className="mt-5 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      FLAGSHIP TREATMENT
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">
                      Apex Matrix 10H Graphene Coating
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Extreme hydrophobics, 90% water spot reduction, 5-Year Certified Warranty.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800/80">
                  <div className="text-xs text-zinc-400">
                    Starting from <span className="text-sm font-bold text-white">₹24,999</span>
                  </div>
                  <button
                    onClick={onOpenBooking}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    View Slots <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Real-time Studio Statistics */}
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-xl font-extrabold text-white font-mono">4.9★</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Google Rating</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-xl font-extrabold text-amber-400 font-mono">5,200+</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Vehicles Detailed</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">100%</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Clean Room Bays</div>
                </div>
              </div>

              {/* Working Hours & Service Area Banner */}
              <div className="mt-5 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
                <div>
                  <span className="text-zinc-200 font-medium">Studio Hours:</span> {settings.openingHours}
                </div>
                <span className="text-amber-400 font-mono text-[11px]">Koramangala 4th Block</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

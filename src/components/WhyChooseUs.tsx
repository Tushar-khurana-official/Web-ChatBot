import React from 'react';
import { Shield, Sparkles, CheckCircle2, XCircle, Flame, Layers, Eye, Gauge } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="technology" className="py-20 bg-zinc-950 relative border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5" />
            Engineering Standards
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            Why Discerning Drivers Entrust Us With Their Cars
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Traditional car spas rely on temporary silicone glazes that wash away in rain. We rebuild optical paint clarity at the molecular level.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Street / Conventional Spas */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
              <XCircle className="w-4 h-4" /> Conventional Car Spas
            </div>
            <ul className="mt-4 space-y-3 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Recycled muddy water & abrasive dirty rag washes introduce millions of micro-scratches.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Rotary buffers burned with harsh compounds, stripping vital clear coat thickness.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Silicone wax fillers that disguise swirls temporarily, lasting only 2 to 3 rain cycles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>No certified clean-room curing environment; dust embeds into wet coating layers.</span>
              </li>
            </ul>
          </div>

          {/* Apex Detailing Studio */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/40 shadow-xl shadow-amber-500/5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> Apex Nanotechnology Studio
            </div>
            <ul className="mt-4 space-y-3 text-xs text-zinc-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Multi-stage iron fallout bath, de-ionized reverse-osmosis rinse, and 3-bucket grit-guarded wash.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ultrasonic digital paint depth mapping guarantees zero unnecessary clear coat removal.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Genuine covalent 9H/10H molecular cross-linking resists harsh chemicals, salt, and bird lime.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pressurized clean rooms with infrared short-wave thermal baking ensure 100% cure hardness.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5-Step Process Timeline */}
        <div className="mt-16 pt-12 border-t border-zinc-800">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white tracking-tight">Our 5-Stage Precision Protocol</h3>
            <p className="text-xs text-zinc-400 mt-1">Every car follows our documented ISO-compliant detailing procedure</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-amber-400 font-mono text-xs font-bold">01 / INSPECTION</div>
              <h4 className="text-sm font-bold text-white mt-1">Paint Health Scan</h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                Digital micron depth measurement on every body panel before touching a polishing pad.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-amber-400 font-mono text-xs font-bold">02 / DECONTAM</div>
              <h4 className="text-sm font-bold text-white mt-1">Chemical Strip</h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                Iron fallout dissolved, industrial fallout extracted, and synthetic clay smoothed to glass.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-amber-400 font-mono text-xs font-bold">03 / CORRECTION</div>
              <h4 className="text-sm font-bold text-white mt-1">Dual-Action Jewel</h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                Compound leveling removes 85-95% of imperfections followed by high-gloss jewel polishing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-amber-400 font-mono text-xs font-bold">04 / APPLICATION</div>
              <h4 className="text-sm font-bold text-white mt-1">Ceramic or PPF</h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                Hand-layered 9H/10H matrix or computer-plotter cut 195-micron self-healing TPU armor.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-amber-400 font-mono text-xs font-bold">05 / CURING</div>
              <h4 className="text-sm font-bold text-white mt-1">Infrared Bake & Cert</h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                Short-wave IR heat curing for maximum hardness, accompanied by official warranty card.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Shield, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
import { BusinessSettings } from '../types';

interface FooterProps {
  settings: BusinessSettings;
  onOpenBooking: () => void;
  onOpenEstimator: () => void;
  onOpenChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenBooking,
  onOpenEstimator,
  onOpenChat,
}) => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 text-xs border-t border-zinc-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Studio Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-zinc-950 font-bold">
                <Shield className="w-5 h-5 text-zinc-950" />
              </div>
              <span className="text-base font-bold text-white tracking-wider font-mono uppercase">
                {settings.businessName}
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Precision paint restoration, 9H/10H ceramic & graphene protection, and self-healing TPU PPF in Bengaluru.
            </p>
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
              <span className="text-amber-400 font-bold block mb-1">DEVELOPMENT NOTICE:</span>
              Realistic sample catalog data displayed for demonstration and testing purposes. Live quotations are calibrated upon in-person vehicle paint inspection.
            </div>
          </div>

          {/* Col 2: Studio Location & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">
              Studio Location
            </h4>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings.openingHours}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.phone}</span>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">
              Direct Actions
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenBooking} className="hover:text-amber-400 transition-colors cursor-pointer">
                  → Reserve Detailing Bay
                </button>
              </li>
              <li>
                <button onClick={onOpenEstimator} className="hover:text-amber-400 transition-colors cursor-pointer">
                  → Interactive Price Estimator
                </button>
              </li>
              <li>
                <button onClick={onOpenChat} className="hover:text-amber-400 transition-colors cursor-pointer">
                  → AI Detailing Specialist Chat
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  → WhatsApp Business Direct <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Studio Policies */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">
              Booking Policies
            </h4>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-[11px]">
              <div>
                <span className="text-zinc-200 font-semibold block">Deposit & Reservation:</span>
                <span>{settings.bookingPolicy}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-200 font-semibold block">Cancellation Terms:</span>
                <span>{settings.cancellationPolicy}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Currency: INR (₹)</span>
            <span>•</span>
            <span>Meta WhatsApp Cloud API Ready</span>
            <span>•</span>
            <span>Firestore Hardened RBAC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

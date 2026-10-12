import React from 'react';
import { Shield, MessageSquare, Calendar, Phone, Lock, Sparkles, UserCheck } from 'lucide-react';
import { BusinessSettings } from '../types';

interface NavbarProps {
  settings: BusinessSettings;
  onOpenBooking: () => void;
  onOpenEstimator: () => void;
  onOpenChat: () => void;
  onToggleAdmin: () => void;
  isAdminView: boolean;
  adminUser: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenBooking,
  onOpenEstimator,
  onOpenChat,
  onToggleAdmin,
  isAdminView,
  adminUser,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-zinc-900 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                  APEX <span className="text-amber-400">DETAILING</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                  STUDIO
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Precision Ceramic, PPF & Paint Correction • Bengaluru
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
            <a href="#services" className="hover:text-amber-400 transition-colors">
              Packages
            </a>
            <button onClick={onOpenEstimator} className="hover:text-amber-400 transition-colors cursor-pointer">
              Price Estimator
            </button>
            <a href="#technology" className="hover:text-amber-400 transition-colors">
              Technology
            </a>
            <a href="#reviews" className="hover:text-amber-400 transition-colors">
              Reviews & FAQ
            </a>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20Apex%20Detailing,%20I%20would%20like%20to%20inquire%20about%20car%20detailing%20packages.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenChat}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              AI Specialist
            </button>

            <button
              onClick={onOpenBooking}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/20 rounded-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>

            {/* Admin Toggle */}
            <button
              onClick={onToggleAdmin}
              title="Admin Dashboard Portal"
              className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                isAdminView
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 font-semibold shadow-md'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {adminUser ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xl:inline text-[11px] font-mono">Admin</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="hidden xl:inline text-[11px] font-mono">Portal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

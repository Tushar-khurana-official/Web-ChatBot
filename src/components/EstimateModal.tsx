import React, { useState } from 'react';
import { X, Calculator, Car, Check, Phone, ArrowRight, Shield, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ServiceItem, VehicleCategory } from '../types';
import { VEHICLE_CATEGORIES } from '../lib/defaultData';

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  onProceedToBooking: (service: ServiceItem, category: VehicleCategory) => void;
}

export const EstimateModal: React.FC<EstimateModalProps> = ({
  isOpen,
  onClose,
  services,
  onProceedToBooking,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'wash-signature');
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('Sedan');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Lead qualification form
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 ');
  const [carModel, setCarModel] = useState<string>('');
  const [primaryConcern, setPrimaryConcern] = useState<string>('swirl_marks');
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  const [savingLead, setSavingLead] = useState<boolean>(false);
  const [leadSaved, setLeadSaved] = useState<boolean>(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addonsList = [
    { id: 'engine_bay', name: 'Engine Bay Steam Degrease & Matte Dress', price: 1499 },
    { id: 'windshield_coat', name: 'Windshield Hydrophobic Ceramic Coat', price: 999 },
    { id: 'ozone_flush', name: 'Ozone Antimicrobial Cabin Flush', price: 1299 },
    { id: 'wheel_faces', name: 'High-Temp Alloy Caliper & Face Coat', price: 2499 },
  ];

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const basePrice = currentService?.categoryPricing?.[vehicleCategory] || currentService?.startingPrice || 0;
  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const item = addonsList.find((a) => a.id === addonId);
    return acc + (item ? item.price : 0);
  }, 0);
  const grandTotal = basePrice + addonsTotal;

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);
    setLeadError(null);

    if (!customerName.trim()) {
      setLeadError('Please provide your name');
      setSavingLead(false);
      return;
    }
    const clean = customerPhone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setLeadError('Please provide a valid 10-digit phone number');
      setSavingLead(false);
      return;
    }
    if (!consentGiven) {
      setLeadError('Consent is required to save callback request');
      setSavingLead(false);
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          vehicleMakeModel: carModel.trim() || undefined,
          vehicleCategory,
          serviceId: currentService.id,
          serviceName: currentService.name,
          primaryConcern,
          budget: `₹${grandTotal.toLocaleString('en-IN')}`,
          source: 'website',
          consentGiven: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setLeadError(data.error || 'Failed to submit quote request');
        setSavingLead(false);
        return;
      }

      setLeadSaved(true);
    } catch {
      setLeadError('Network connection error');
    } finally {
      setSavingLead(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Interactive Detailing Price Estimator</h3>
              <p className="text-xs text-zinc-400">Calibrated pricing by vehicle classification & add-ons</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Vehicle Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              1. Select Vehicle Segment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {VEHICLE_CATEGORIES.map((vc) => (
                <button
                  key={vc.category}
                  type="button"
                  onClick={() => setVehicleCategory(vc.category)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                    vehicleCategory === vc.category
                      ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300 shadow-sm'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold">{vc.category}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${vehicleCategory === vc.category ? 'text-zinc-800' : 'text-zinc-500'}`}>
                    {vc.examples.split(',')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Package Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              2. Choose Detailing Package
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
              {services.map((s) => {
                const isSelected = selectedServiceId === s.id;
                const p = s.categoryPricing?.[vehicleCategory] || s.startingPrice;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{s.name}</div>
                    <div className="mt-2 flex items-baseline justify-between pt-1 border-t border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400">{s.durationMinutes} mins</span>
                      <span className="text-xs font-extrabold text-amber-400 font-mono">
                        ₹{p.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Optional Add-ons */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              3. Recommended Studio Add-Ons
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {addonsList.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-400 text-white'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        isSelected ? 'bg-amber-400 text-zinc-950 border-amber-300 font-bold' : 'border-zinc-700'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                      <span className="text-[11px] leading-tight">{addon.name}</span>
                    </div>
                    <span className="font-mono text-zinc-300 shrink-0 ml-2">
                      +₹{addon.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Calculation Display */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 block uppercase font-mono">
                Estimated Investment ({vehicleCategory})
              </span>
              <span className="text-xs text-zinc-300 font-medium">
                {currentService.name} {selectedAddons.length > 0 ? `+ ${selectedAddons.length} Add-on(s)` : ''}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              {currentService.inspectionRequired && (
                <span className="block text-[10px] text-zinc-400 font-medium">
                  *Inspection required for final quote
                </span>
              )}
            </div>
          </div>

          {/* Lead capture / callback request form */}
          {!leadSaved ? (
            <form onSubmit={handleSaveLead} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> Want our studio manager to call you with a written quotation?
                </span>
              </div>

              {leadError && (
                <div className="p-2 rounded bg-rose-500/10 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {leadError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone (+91)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <input
                  type="text"
                  placeholder="Car Model (e.g. Creta)"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="rounded border-zinc-700 text-amber-500 focus:ring-0"
                  />
                  <span>I agree to receive a detailing callback / WhatsApp quote</span>
                </label>

                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {savingLead ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Request Quote'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Inquiry saved! Our senior technician will contact you on WhatsApp shortly.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onProceedToBooking(currentService, vehicleCategory);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Proceed to Slot Booking for ₹{grandTotal.toLocaleString('en-IN')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

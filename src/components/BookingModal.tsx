import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Car, User, Phone, Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ServiceItem, VehicleCategory, Booking } from '../types';
import { VEHICLE_CATEGORIES } from '../lib/defaultData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  preSelectedService?: ServiceItem | null;
  preSelectedCategory?: VehicleCategory;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  preSelectedService,
  preSelectedCategory,
  onBookingSuccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('Sedan');
  const [vehicleMakeModel, setVehicleMakeModel] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentSlot, setAppointmentSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<{ slot: string; isAvailable: boolean; conflictReason?: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 ');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Initialize today's date + 1 day
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      setAppointmentDate(dateStr);

      if (preSelectedService) {
        setSelectedServiceId(preSelectedService.id);
      } else if (services.length > 0 && !selectedServiceId) {
        setSelectedServiceId(services[0].id);
      }

      if (preSelectedCategory) {
        setVehicleCategory(preSelectedCategory);
      }
    }
  }, [isOpen, preSelectedService, preSelectedCategory, services]);

  // Fetch slot availability when date or service changes
  useEffect(() => {
    if (isOpen && appointmentDate) {
      fetchSlots(appointmentDate);
    }
  }, [isOpen, appointmentDate]);

  const fetchSlots = async (date: string) => {
    setLoadingSlots(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/slots?date=${date}`);
      const data = await res.json();
      if (data.slots) {
        setAvailableSlots(data.slots);
      }
    } catch {
      setSubmitError('Unable to check slot availability. Please retry.');
    } finally {
      setLoadingSlots(false);
    }
  };

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const calculatedPrice = currentService?.categoryPricing?.[vehicleCategory] || currentService?.startingPrice || 0;

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setSubmitError(null);

    // Validation
    if (!customerName.trim()) {
      setSubmitError('Please enter your full name');
      setSubmitting(false);
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setSubmitError('Please enter a valid 10-digit phone number with country code');
      setSubmitting(false);
      return;
    }
    if (!appointmentSlot) {
      setSubmitError('Please select a time slot');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          serviceId: currentService.id,
          serviceName: currentService.name,
          vehicleMakeModel: vehicleMakeModel.trim() || 'Vehicle',
          vehicleCategory,
          appointmentDate,
          appointmentSlot,
          durationMinutes: currentService.durationMinutes,
          estimatedPrice: calculatedPrice,
          notes: customerNotes.trim() || undefined,
          bookingSource: 'website',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Booking reservation failed. Slot might have been booked.');
        setSubmitting(false);
        return;
      }

      setConfirmedBooking(data);
      if (onBookingSuccess) onBookingSuccess(data);
      setStep(4); // Success step
    } catch (err) {
      setSubmitError('Network failure occurred. Please recheck your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setConfirmedBooking(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Detailing Appointment Reservation
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Clean-Room Detailing Bay • Koramangala 4th Block, Bengaluru
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="px-6 py-3 bg-zinc-900/30 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className={step >= 1 ? 'text-amber-400 font-bold' : ''}>1. Service & Car</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-amber-400 font-bold' : ''}>2. Date & Time Slot</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-amber-400 font-bold' : ''}>3. Customer Details</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: SERVICE & VEHICLE */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Select Detailing Package
                </label>
                <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {services
                    .filter((s) => s.isActive)
                    .map((s) => {
                      const isSelected = selectedServiceId === s.id;
                      const p = s.categoryPricing?.[vehicleCategory] || s.startingPrice;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedServiceId(s.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-400/10 border-amber-500 text-white'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold">{s.name}</div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span>{s.category}</span>
                              <span>•</span>
                              <span>{s.durationMinutes} mins</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-amber-400 font-mono">
                              ₹{p.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Vehicle Category & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Vehicle Category
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value as VehicleCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {VEHICLE_CATEGORIES.map((vc) => (
                      <option key={vc.category} value={vc.category}>
                        {vc.category} ({vc.examples.split(',').slice(0, 2).join(',')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Car Make & Model
                  </label>
                  <input
                    type="text"
                    value={vehicleMakeModel}
                    onChange={(e) => setVehicleMakeModel(e.target.value)}
                    placeholder="e.g. BMW 330Li / Hyundai Creta"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Price Preview Card */}
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  Estimated Total for {vehicleCategory}:
                </span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  ₹{calculatedPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Select Preferred Appointment Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Available Bay Slots for {appointmentDate}
                  </label>
                  {loadingSlots && (
                    <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking real-time slots...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableSlots.map((s) => {
                    const isSelected = appointmentSlot === s.slot;
                    return (
                      <button
                        key={s.slot}
                        disabled={!s.isAvailable}
                        onClick={() => setAppointmentSlot(s.slot)}
                        className={`p-3 rounded-xl text-center border transition-all text-xs font-mono cursor-pointer ${
                          !s.isAvailable
                            ? 'bg-zinc-900/30 border-zinc-800 text-zinc-600 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300 shadow-md shadow-amber-400/20'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                        }`}
                      >
                        {s.slot}
                        {!s.isAvailable && (
                          <span className="block text-[9px] text-rose-400/80 no-underline mt-0.5">
                            Reserved
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400">
                <span className="text-zinc-200 font-semibold">Concurrency Notice:</span> Slots are locked in real-time on our server during final confirmation to ensure no double bookings occur.
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOMER CONTACT & CONFIRMATION SUMMARY */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  Reservation Summary
                </div>
                <div className="flex justify-between text-white">
                  <span>Package:</span>
                  <span className="font-bold">{currentService.name}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Vehicle:</span>
                  <span>{vehicleMakeModel || 'Unspecified'} ({vehicleCategory})</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Schedule:</span>
                  <span className="font-mono text-amber-400">{appointmentDate} at {appointmentSlot}</span>
                </div>
                <div className="flex justify-between text-white pt-2 border-t border-zinc-800 font-mono">
                  <span>Estimated Total:</span>
                  <span className="text-base font-bold text-amber-400">₹{calculatedPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Arjun Patel"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Special Requests / Main Concerns
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Swirl marks on hood, pet hair in boot, leather stains..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && confirmedBooking && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-bold text-white">
                Appointment Successfully Reserved!
              </h4>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Booking Reference:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {confirmedBooking.bookingReference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Treatment:</span>
                  <span className="font-semibold text-white">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Slot:</span>
                  <span className="font-mono text-white">
                    {confirmedBooking.appointmentDate} at {confirmedBooking.appointmentSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Vehicle:</span>
                  <span className="text-white">
                    {confirmedBooking.vehicleMakeModel} ({confirmedBooking.vehicleCategory})
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800">
                  <span className="text-zinc-400">Estimated Price:</span>
                  <span className="font-mono font-bold text-white">
                    ₹{confirmedBooking.estimatedPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                A confirmation has been recorded in our appointment schedule. Our detailing team will greet you at Koramangala Studio!
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <a
                  href={`https://wa.me/919876543210?text=Hi%20Apex%20Detailing,%20I%20have%20booked%20an%20appointment%20with%20reference%20${confirmedBooking.bookingReference}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Phone className="w-3.5 h-3.5" /> Open in WhatsApp
                </a>
                <button
                  onClick={resetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="p-5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                disabled={step === 2 && !appointmentSlot}
                onClick={() => setStep(step + 1)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  step === 2 && !appointmentSlot
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-amber-400 text-zinc-950 hover:brightness-110 shadow-md shadow-amber-400/20'
                }`}
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmitBooking}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying & Locking Slot...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Book Appointment
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

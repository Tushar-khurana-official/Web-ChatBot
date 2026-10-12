import React, { useState } from 'react';
import { Save, Check, Loader2, Building, Phone, Clock, FileText } from 'lucide-react';
import { BusinessSettings } from '../../types';

interface SettingsTabProps {
  settings: BusinessSettings;
  onRefresh: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<BusinessSettings>({ ...settings });
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Business Settings & Studio Policies</h3>
          <p className="text-xs text-zinc-400">Configure studio details, WhatsApp number, and appointment policies</p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Studio Identity */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            <Building className="w-4 h-4" /> Studio Identity & Location
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Business Name</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">City & Service Area</label>
            <input
              type="text"
              required
              value={formData.cityAndServiceArea}
              onChange={(e) => setFormData({ ...formData, cityAndServiceArea: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Studio Address</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Contact & Hours */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            <Phone className="w-4 h-4" /> Contact & Operating Schedule
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Studio Phone Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">WhatsApp Business Number</label>
            <input
              type="text"
              required
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Opening Hours</label>
            <input
              type="text"
              required
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Policies */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            <FileText className="w-4 h-4" /> Customer Booking & Cancellation Policies
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Reservation & Booking Policy</label>
              <textarea
                rows={3}
                required
                value={formData.bookingPolicy}
                onChange={(e) => setFormData({ ...formData, bookingPolicy: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Cancellation & Reschedule Policy</label>
              <textarea
                rows={3}
                required
                value={formData.cancellationPolicy}
                onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

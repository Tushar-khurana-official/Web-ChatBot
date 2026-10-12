import React, { useState } from 'react';
import { Edit3, Check, Save, Clock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { ServiceItem, VehicleCategory } from '../../types';

interface ServicesTabProps {
  services: ServiceItem[];
  onRefresh: () => void;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({ services, onRefresh }) => {
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceItem>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const startEdit = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      startingPrice: service.startingPrice,
      inspectionRequired: service.inspectionRequired,
      isActive: service.isActive,
      categoryPricing: { ...service.categoryPricing },
    });
    setSaveSuccess(false);
  };

  const handlePriceTierChange = (category: VehicleCategory, price: number) => {
    setFormData((prev) => ({
      ...prev,
      categoryPricing: {
        ...(prev.categoryPricing as Record<VehicleCategory, number>),
        [category]: price,
      },
    }));
  };

  const handleSave = async (serviceId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setEditingServiceId(null);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Detailing Catalog & Tiered Pricing</h3>
          <p className="text-xs text-zinc-400">Configure prices, treatment durations, and vehicle segment rates</p>
        </div>
        {saveSuccess && (
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Service updated successfully!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {services.map((service) => {
          const isEditing = editingServiceId === service.id;

          return (
            <div
              key={service.id}
              className={`p-6 rounded-2xl border transition-all ${
                isEditing
                  ? 'bg-zinc-900 border-amber-500/60 shadow-xl shadow-amber-500/5'
                  : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {service.category}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        service.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">{service.name}</h4>
                </div>

                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingServiceId(null)}
                        className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={saving}
                        onClick={() => handleSave(service.id)}
                        className="px-4 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(service)}
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Pricing
                    </button>
                  )}
                </div>
              </div>

              {/* Form or Display View */}
              {isEditing ? (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        value={formData.durationMinutes || 60}
                        onChange={(e) =>
                          setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Inspection Required</label>
                      <select
                        value={formData.inspectionRequired ? 'yes' : 'no'}
                        onChange={(e) =>
                          setFormData({ ...formData, inspectionRequired: e.target.value === 'yes' })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs"
                      >
                        <option value="no">No - Fixed Online Estimate</option>
                        <option value="yes">Yes - Requires In-Person Measurement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Status</label>
                      <select
                        value={formData.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs"
                      >
                        <option value="active">Active in Catalog</option>
                        <option value="inactive">Hidden / Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing Tiers Table */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      Vehicle Segment Pricing Tiers (INR ₹)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {(['Hatchback', 'Sedan', 'Compact SUV', 'Full SUV', 'Luxury & Sports'] as VehicleCategory[]).map(
                        (cat) => (
                          <div key={cat} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                            <span className="text-[11px] text-zinc-400 block font-medium truncate">{cat}</span>
                            <div className="mt-1 flex items-center">
                              <span className="text-zinc-500 text-xs font-mono mr-1">₹</span>
                              <input
                                type="number"
                                value={formData.categoryPricing?.[cat] || 0}
                                onChange={(e) => handlePriceTierChange(cat, parseInt(e.target.value, 10) || 0)}
                                className="w-full bg-transparent text-white font-mono text-xs font-bold focus:outline-none"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {(['Hatchback', 'Sedan', 'Compact SUV', 'Full SUV', 'Luxury & Sports'] as VehicleCategory[]).map(
                    (cat) => (
                      <div key={cat} className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">
                          {cat}
                        </span>
                        <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">
                          ₹{(service.categoryPricing?.[cat] || service.startingPrice).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

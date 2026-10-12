import React, { useState } from 'react';
import { Search, Download, Calendar, Phone, Clock, AlertTriangle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Booking, BookingStatus } from '../../types';

interface BookingsTabProps {
  bookings: Booking[];
  onRefresh: () => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, onRefresh }) => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses: (BookingStatus | 'All')[] = [
    'All',
    'Pending',
    'Confirmed',
    'Completed',
    'Reschedule Requested',
    'Cancelled',
    'No Show',
  ];

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.bookingReference.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.vehicleMakeModel.toLowerCase().includes(q) ||
        b.appointmentDate.includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Reference', 'Name', 'Phone', 'Email', 'Service', 'Vehicle', 'Category', 'Date', 'Slot', 'Price (INR)', 'Status', 'Notes', 'Created'];
    const rows = filteredBookings.map((b) => [
      b.bookingReference,
      `"${b.customerName}"`,
      `"${b.customerPhone}"`,
      `"${b.customerEmail || ''}"`,
      `"${b.serviceName}"`,
      `"${b.vehicleMakeModel}"`,
      b.vehicleCategory,
      b.appointmentDate,
      b.appointmentSlot,
      b.estimatedPrice,
      b.status,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
      b.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_detailing_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Reschedule Requested':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'No Show':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings by reference, customer, vehicle, date..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="px-4 py-3.5">Ref & Customer</th>
                <th className="px-4 py-3.5">Appointment Slot</th>
                <th className="px-4 py-3.5">Treatment & Vehicle</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    No appointments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isUpdating = updatingId === b.id;
                  return (
                    <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-amber-400 text-xs">
                          {b.bookingReference}
                        </div>
                        <div className="font-bold text-white text-xs mt-0.5">{b.customerName}</div>
                        <a
                          href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" /> {b.customerPhone}
                        </a>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-mono text-white flex items-center gap-1.5 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" /> {b.appointmentDate}
                        </div>
                        <div className="font-mono text-zinc-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-500" /> {b.appointmentSlot} ({b.durationMinutes}m)
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-white">{b.serviceName}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {b.vehicleMakeModel} • <span className="text-amber-400/90">{b.vehicleCategory}</span>
                        </div>
                        {b.notes && (
                          <div className="text-[10px] text-zinc-500 truncate max-w-xs mt-0.5">
                            Notes: {b.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        ₹{b.estimatedPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          disabled={isUpdating}
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border focus:outline-none ${getStatusBadge(
                            b.status
                          )}`}
                        >
                          {statuses
                            .filter((s) => s !== 'All')
                            .map((st) => (
                              <option key={st} value={st} className="bg-zinc-900 text-white">
                                {st}
                              </option>
                            ))}
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleStatusChange(b.id, 'Completed')}
                          title="Mark Completed"
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors inline-block"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'Cancelled')}
                          title="Cancel Booking"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors inline-block"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

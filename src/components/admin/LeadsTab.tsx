import React, { useState } from 'react';
import { Search, Download, Filter, Phone, Calendar, User, Check, Edit2, Loader2 } from 'lucide-react';
import { Lead, LeadStatus } from '../../types';

interface LeadsTabProps {
  leads: Lead[];
  onRefresh: () => void;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({ leads, onRefresh }) => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const statuses: (LeadStatus | 'All')[] = [
    'All',
    'New',
    'Contacted',
    'Quotation Sent',
    'Interested',
    'Booking Confirmed',
    'Lost',
  ];

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== 'All' && l.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.customerName.toLowerCase().includes(q) ||
        l.customerPhone.toLowerCase().includes(q) ||
        (l.serviceName && l.serviceName.toLowerCase().includes(q)) ||
        (l.vehicleMakeModel && l.vehicleMakeModel.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      await fetch(`/api/leads/${leadId}/status`, {
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

  const handleSaveNotes = async (leadId: string) => {
    setUpdatingId(leadId);
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpNotes: tempNotes }),
      });
      setEditingNotesId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Vehicle', 'Category', 'Service', 'Concern', 'Budget', 'Status', 'Consent', 'Created At', 'Notes'];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.customerName}"`,
      `"${l.customerPhone}"`,
      `"${l.vehicleMakeModel || ''}"`,
      l.vehicleCategory || '',
      `"${l.serviceName || ''}"`,
      `"${l.primaryConcern || ''}"`,
      `"${l.budget || ''}"`,
      l.status,
      l.consentGiven ? 'YES' : 'NO',
      l.createdAt,
      `"${(l.followUpNotes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_detailing_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Contacted':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Quotation Sent':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Interested':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Booking Confirmed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Lost':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by customer name, phone, car..."
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

      {/* Leads Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="px-4 py-3.5">Customer & Phone</th>
                <th className="px-4 py-3.5">Vehicle</th>
                <th className="px-4 py-3.5">Requested Treatment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Follow-Up Notes</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isUpdating = updatingId === lead.id;
                  const isEditingNotes = editingNotesId === lead.id;

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-xs">{lead.customerName}</div>
                        <a
                          href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" /> {lead.customerPhone}
                        </a>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Source: {lead.source} • {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-zinc-200 font-medium">{lead.vehicleMakeModel || 'Not Specified'}</div>
                        <div className="text-[10px] text-amber-400/90 font-mono">{lead.vehicleCategory}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-zinc-200 font-medium">{lead.serviceName || 'General Inquiry'}</div>
                        {lead.primaryConcern && (
                          <div className="text-[11px] text-zinc-400 truncate max-w-xs mt-0.5">
                            Concern: {lead.primaryConcern}
                          </div>
                        )}
                        {lead.budget && (
                          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                            Budget: {lead.budget}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          disabled={isUpdating}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border focus:outline-none ${getStatusBadge(
                            lead.status
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

                      <td className="px-4 py-3.5 max-w-xs">
                        {isEditingNotes ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className="px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-white text-xs flex-1"
                            />
                            <button
                              onClick={() => handleSaveNotes(lead.id)}
                              className="p-1 rounded bg-amber-400 text-zinc-950 hover:brightness-110"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNotesId(lead.id);
                              setTempNotes(lead.followUpNotes || '');
                            }}
                            className="text-zinc-400 hover:text-zinc-200 cursor-pointer flex items-center gap-1 group text-[11px]"
                          >
                            <span className="truncate">{lead.followUpNotes || 'Add notes...'}</span>
                            <Edit2 className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0 ml-1" />
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <a
                          href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            lead.customerName
                          )},%20this%20is%20Apex%20Auto%20Detailing%20following%20up%20on%20your%20inquiry.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 font-semibold text-[11px] border border-emerald-500/30"
                        >
                          <Phone className="w-3 h-3" /> WhatsApp
                        </a>
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

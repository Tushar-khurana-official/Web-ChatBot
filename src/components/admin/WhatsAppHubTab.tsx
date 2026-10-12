import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2, AlertTriangle, Send, RefreshCw, Key, Shield, MessageSquare, Loader2 } from 'lucide-react';

export const WhatsAppHubTab: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulator states
  const [simPhone, setSimPhone] = useState<string>('919876543210');
  const [simMessage, setSimMessage] = useState<string>('Hi, what is the price of 10H Graphene coating for a Creta?');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Outbound test states
  const [outboundTo, setOutboundTo] = useState<string>('919876543210');
  const [outboundMsg, setOutboundMsg] = useState<string>('🚗 Apex Auto Detailers: Your appointment has been confirmed!');
  const [sendingOutbound, setSendingOutbound] = useState<boolean>(false);
  const [outboundResult, setOutboundResult] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPhone: simPhone,
          messageText: simMessage,
        }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      setSimResult({ error: (err as Error).message });
    } finally {
      setSimulating(false);
    }
  };

  const handleSendOutbound = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingOutbound(true);
    setOutboundResult(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: outboundTo,
          message: outboundMsg,
        }),
      });
      const data = await res.json();
      setOutboundResult(data);
    } catch (err) {
      setOutboundResult({ error: (err as Error).message });
    } finally {
      setSendingOutbound(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview & Credentials Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Meta WhatsApp Business Platform Cloud API
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Official Meta Graph API v21.0 integration for inbound customer inquiries and automated appointment confirmations
            </p>
          </div>

          <button
            onClick={fetchStatus}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Check Status
          </button>
        </div>

        {/* Status Indicators */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-mono uppercase block">WHATSAPP_PHONE_NUMBER_ID</span>
            <div className="mt-1 flex items-center gap-1.5">
              {status?.phoneNumberIdConfigured ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Unset (Simulated)
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-mono uppercase block">WHATSAPP_ACCESS_TOKEN</span>
            <div className="mt-1 flex items-center gap-1.5">
              {status?.accessTokenConfigured ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Bearer
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Unset (Simulated)
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-mono uppercase block">WHATSAPP_VERIFY_TOKEN</span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-mono uppercase block">META_APP_SECRET (HMAC SHA-256)</span>
            <div className="mt-1 flex items-center gap-1.5">
              {status?.appSecretConfigured ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </span>
              ) : (
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                  Development Bypass
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Webhook Configuration URL for Meta Dashboard */}
        <div className="mt-5 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
          <div className="text-amber-400 font-semibold font-mono uppercase text-[11px]">
            Meta Developer App Webhook Configuration
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
            <div>
              <span className="text-zinc-500 block text-[10px]">Callback URL (GET & POST):</span>
              <code className="text-[11px] text-white font-mono bg-zinc-900 px-2 py-1 rounded block mt-0.5 break-all">
                {window.location.origin}/api/whatsapp/webhook
              </code>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Verify Token:</span>
              <code className="text-[11px] text-amber-300 font-mono bg-zinc-900 px-2 py-1 rounded block mt-0.5">
                apex_verify_token_2026
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbound Simulator */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            Inbound WhatsApp Webhook Simulator
          </div>
          <p className="text-xs text-zinc-400">
            Simulate a customer sending a message to your WhatsApp number. Tests webhook verification, signature validation, Gemini catalog lookup, and reply queuing.
          </p>

          <form onSubmit={handleSimulateInbound} className="space-y-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Customer Mobile Number</label>
              <input
                type="text"
                value={simPhone}
                onChange={(e) => setSimPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Incoming Message Text</label>
              <textarea
                rows={2}
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={simulating}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Dispatch Simulated Webhook Event
            </button>
          </form>

          {simResult && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <span className="text-[10px] uppercase font-mono text-emerald-400 block font-bold">
                Webhook Processing Outcome:
              </span>
              <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap">
                {JSON.stringify(simResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Outbound Dispatcher */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Send className="w-4 h-4 text-amber-400" />
            Outbound WhatsApp Cloud API Notification Test
          </div>
          <p className="text-xs text-zinc-400">
            Dispatch a direct notification message via Meta WhatsApp Cloud API. If live credentials are unset, cleanly runs in simulated development mode.
          </p>

          <form onSubmit={handleSendOutbound} className="space-y-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Recipient Mobile Number</label>
              <input
                type="text"
                value={outboundTo}
                onChange={(e) => setOutboundTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Notification Text</label>
              <textarea
                rows={2}
                value={outboundMsg}
                onChange={(e) => setOutboundMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={sendingOutbound}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:brightness-110 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/20"
            >
              {sendingOutbound ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Outbound Message
            </button>
          </form>

          {outboundResult && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <span className="text-[10px] uppercase font-mono text-amber-400 block font-bold">
                API Response:
              </span>
              <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap">
                {JSON.stringify(outboundResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

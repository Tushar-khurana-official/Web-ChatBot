import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Phone,
  Calendar,
  Calculator,
  RefreshCw,
  User,
  Shield,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { ChatMessage, BusinessSettings } from '../types';

interface ChatWidgetProps {
  settings: BusinessSettings;
  isOpen: boolean;
  onToggle: () => void;
  onOpenBooking: () => void;
  onOpenEstimator: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  settings,
  isOpen,
  onToggle,
  onOpenBooking,
  onOpenEstimator,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial welcoming message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'assistant',
          text: `Hi! Welcome to ${settings.businessName} 🚗\n\nLooking to make your car shine like new?\n\nI can help you explore our detailing packages, get an estimated price, or book an appointment.\n\nHow can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: [
            '1. Explore Services',
            '2. Get a Price Estimate',
            '3. Book an Appointment',
            '4. Ask a Question',
            '5. Chat on WhatsApp',
          ],
        },
      ]);
    }
  }, [settings.businessName]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    // Handle Quick Reply shortcut 5 directly
    if (text.includes('Chat on WhatsApp')) {
      const waUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20Apex%20Detailing,%20I%20have%20a%20question%20about%20your%20services.`;
      window.open(waUrl, '_blank');
      return;
    }
    if (text.includes('Book an Appointment')) {
      onOpenBooking();
      return;
    }
    if (text.includes('Get a Price Estimate')) {
      onOpenEstimator();
      return;
    }

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLastUserMessage(text);
    setIsTyping(true);
    setHasError(false);

    try {
      const conversationHistory = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          currentMessage: text,
          channel: 'website',
        }),
      });

      if (!res.ok) {
        throw new Error('Chat assistant response error');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: data.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: data.actionCard,
        quickReplies: ['Explore Packages', 'Book This Service', 'Talk to a Human', 'Chat on WhatsApp'],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setHasError(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage);
    }
  };

  const handleActionCardClick = (actionCard: NonNullable<ChatMessage['actionCard']>) => {
    if (actionCard.type === 'booking') {
      onOpenBooking();
    } else if (actionCard.type === 'estimate') {
      onOpenEstimator();
    } else if (actionCard.type === 'whatsapp' || actionCard.type === 'human_handoff') {
      const waUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20Apex%20Detailing,%20I%20would%20like%20to%20speak%20with%20a%20human%20detailing%20advisor.`;
      window.open(waUrl, '_blank');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-zinc-900 to-zinc-950 text-white border border-amber-500/40 shadow-2xl shadow-black hover:border-amber-400 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-amber-500/30">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
          </div>

          <div className="text-left hidden sm:block pr-2">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Detailing AI Specialist</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                LIVE
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">Ask packages, pricing & slots</div>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-zinc-950 font-bold shadow-md">
                <Shield className="w-5 h-5 text-zinc-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {settings.businessName}
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-zinc-400">AI Customer Specialist • Bengaluru</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* WhatsApp direct handoff button in header */}
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20Apex%20Detailing,%20chatting%20from%20the%20website%20widget.`}
                target="_blank"
                rel="noopener noreferrer"
                title="Handoff to WhatsApp"
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-zinc-800 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950/90 text-xs">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                      isAssistant
                        ? 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-sm'
                        : 'bg-amber-400 text-zinc-950 font-medium rounded-tr-sm shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Action Card Attachment */}
                    {msg.actionCard && (
                      <div className="mt-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-700/80 space-y-2">
                        <div className="text-[11px] font-bold text-amber-400">
                          {msg.actionCard.title || 'Recommended Action'}
                        </div>
                        <button
                          onClick={() => handleActionCardClick(msg.actionCard!)}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-400 text-zinc-950 font-bold text-[11px] flex items-center justify-center gap-1 hover:brightness-110 cursor-pointer"
                        >
                          {msg.actionCard.type === 'booking' && (
                            <>
                              <Calendar className="w-3.5 h-3.5" /> Book This Slot
                            </>
                          )}
                          {msg.actionCard.type === 'estimate' && (
                            <>
                              <Calculator className="w-3.5 h-3.5" /> View Detailed Estimate
                            </>
                          )}
                          {(msg.actionCard.type === 'whatsapp' || msg.actionCard.type === 'human_handoff') && (
                            <>
                              <Phone className="w-3.5 h-3.5 text-emerald-900" /> Chat on WhatsApp
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-zinc-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>

                  {/* Quick Replies Buttons */}
                  {isAssistant && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                      {msg.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(qr)}
                          className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 max-w-[120px]">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-mono">Analyzing...</span>
              </div>
            )}

            {/* Error and Retry State */}
            {hasError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <span>Network interruption. Could not send message.</span>
                <button
                  onClick={handleRetry}
                  className="px-2 py-1 rounded bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="px-3 py-1.5 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-[11px]">
            <button
              onClick={onOpenBooking}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Calendar className="w-3 h-3" /> Book Slot
            </button>
            <span className="text-zinc-600">•</span>
            <button
              onClick={onOpenEstimator}
              className="text-zinc-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Calculator className="w-3 h-3" /> Price Calculator
            </button>
            <span className="text-zinc-600">•</span>
            <button
              onClick={() => handleSendMessage('Can I talk to a human detailing manager?')}
              className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3 h-3" /> Human Handoff
            </button>
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about ceramic, PPF, wash, or slots..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                inputText.trim() && !isTyping
                  ? 'bg-amber-400 text-zinc-950 hover:brightness-110 shadow-md shadow-amber-400/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

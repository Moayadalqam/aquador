'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, User, Bot, ArrowLeft } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import Image from 'next/image';
import Link from 'next/link';

type ChatMode = 'ai' | 'live' | 'menu';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LiveMessage {
  id: string;
  sender_type: 'visitor' | 'admin' | 'system';
  content: string;
  created_at: string;
}

interface LiveChatSession {
  sessionId: string;
  sessionSecret: string;
}

const STORAGE_KEY = 'aquador_live_chat';

function persistSession(session: LiveChatSession) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch { /* noop */ }
}

function loadSession(): LiveChatSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.sessionId && parsed?.sessionSecret) return parsed;
  } catch { /* noop */ }
  return null;
}

function clearSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

function renderMarkdown(text: string) {
  const parts: (string | JSX.Element)[] = [];
  let keyIndex = 0;
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1] && match[2]) {
      parts.push(<Link key={`link-${keyIndex++}`} href={match[2]} className="text-gold hover:text-gold-light underline underline-offset-2">{match[1]}</Link>);
    } else if (match[3]) {
      parts.push(<strong key={`bold-${keyIndex++}`} className="font-semibold">{match[3]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('aquador_visitor_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('aquador_visitor_id', id); }
  return id;
}

function AquadorBottleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="1" width="6" height="2" rx="0.5" />
      <rect x="10" y="3" width="4" height="3" rx="0.5" />
      <rect x="7" y="6" width="10" height="15" rx="2" />
      <text
        x="12"
        y="16"
        fontSize="8"
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
      >
        ?
      </text>
    </svg>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('ai');
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: "Welcome to Aquad'or! How can I help you find your perfect scent?", timestamp: new Date() }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [liveSession, setLiveSession] = useState<LiveChatSession | null>(null);
  const [liveStatus, setLiveStatus] = useState<'waiting' | 'active' | 'closed'>('waiting');
  const [liveInput, setLiveInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, liveMessages]);
  useEffect(() => { if (isOpen && mode === 'ai') inputRef.current?.focus(); if (isOpen && mode === 'live') liveInputRef.current?.focus(); }, [isOpen, mode]);

  const fetchSessionData = useCallback(async (session: LiveChatSession) => {
    try {
      const res = await fetch(`/api/live-chat/session/${session.sessionId}?secret=${encodeURIComponent(session.sessionSecret)}`);
      if (!res.ok) {
        if (res.status === 404) { clearSession(); setLiveSession(null); }
        return;
      }
      const data = await res.json();
      setLiveMessages(data.messages || []);
      setLiveStatus(data.status as 'waiting' | 'active' | 'closed');
    } catch (err) {
      Sentry.captureException(err);
    }
  }, []);

  useEffect(() => {
    if (!liveSession) return;
    fetchSessionData(liveSession);
    const interval = setInterval(() => fetchSessionData(liveSession), 5000);
    return () => clearInterval(interval);
  }, [liveSession, fetchSessionData]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]); setInput(''); setIsLoading(true);
    try {
      const response = await fetch('/api/ai-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) }) });
      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }]);
    } catch (error) {
      Sentry.addBreadcrumb({ category: 'chat-widget', message: 'Chat error', level: 'error', data: { error } });
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again or [contact us](/contact).", timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const startLiveChat = useCallback(async () => {
    const saved = loadSession();
    if (saved) {
      setLiveSession(saved);
      setMode('live');
      return;
    }

    const visitorId = getVisitorId();
    try {
      const res = await fetch('/api/live-chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      });
      if (!res.ok) {
        Sentry.captureMessage('Failed to create live chat session');
        return;
      }
      const data = await res.json();
      const session: LiveChatSession = { sessionId: data.sessionId, sessionSecret: data.sessionSecret };
      persistSession(session);
      setLiveSession(session);
      setLiveStatus(data.status as 'waiting' | 'active' | 'closed');
      setMode('live');

      if (!data.resumed) {
        fetch('/api/live-chat/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.sessionId, sessionSecret: session.sessionSecret }),
        }).catch(() => {});
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }, []);

  const handleLiveSend = async () => {
    if (!liveInput.trim() || !liveSession) return;
    const content = liveInput.trim(); setLiveInput('');
    const optimisticMsg: LiveMessage = { id: `opt-${Date.now()}`, sender_type: 'visitor', content, created_at: new Date().toISOString() };
    setLiveMessages(prev => [...prev, optimisticMsg]);
    try {
      await fetch('/api/live-chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: liveSession.sessionId, sessionSecret: liveSession.sessionSecret, text: content }),
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (mode === 'ai') handleSend(); else if (mode === 'live') handleLiveSend(); } };
  const suggestions = ["Jasmine scents", "Woody fragrances", "For men"];
  const handleToggle = () => { if (!isOpen) setMode('menu'); setIsOpen(!isOpen); };

  return (
    <>
      <button onClick={handleToggle} className="chat-toggle-btn fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-br from-gold to-gold-light rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
        {isOpen ? (<X className="w-6 h-6 text-dark" />) : (<span className="relative"><AquadorBottleIcon className="w-6 h-6 text-dark" /><span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-gold" /></span>)}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="chat-window fixed z-50 bg-white border border-gold/20 shadow-2xl flex flex-col overflow-hidden bottom-20 right-4 w-[320px] h-[420px] rounded-2xl max-[480px]:bottom-0 max-[480px]:right-0 max-[480px]:left-0 max-[480px]:w-full max-[480px]:h-[100dvh] max-[480px]:rounded-none">
            {mode === 'menu' && (
              <div className="flex flex-col h-full">
                <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border-b border-gold/20 p-2.5 flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white border border-gold/30 flex items-center justify-center"><Image src="/aquador-logo.png" alt="Aquad'or" width={36} height={36} className="object-cover" /></div>
                  <div className="flex-1"><h3 className="text-black font-semibold text-sm">How can we help?</h3><p className="text-[10px] text-gray-400">Choose an option below</p></div>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors min-[481px]:hidden"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="flex-1 flex flex-col gap-3 p-4 justify-center">
                  <button onClick={() => setMode('ai')} className="flex items-center gap-3 p-4 bg-gray-50 border border-gold/20 rounded-xl hover:border-gold hover:bg-gold/5 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors"><Bot className="w-5 h-5 text-gold" /></div>
                    <div className="text-left"><p className="text-sm font-semibold text-black">AI Fragrance Expert</p><p className="text-[11px] text-gray-500">Get instant product recommendations</p></div>
                  </button>
                  <button onClick={startLiveChat} className="flex items-center gap-3 p-4 bg-gray-50 border border-gold/20 rounded-xl hover:border-gold hover:bg-gold/5 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors"><User className="w-5 h-5 text-gold" /></div>
                    <div className="text-left"><p className="text-sm font-semibold text-black">Talk to a Human</p><p className="text-[11px] text-gray-500">Chat with our team in real time</p></div>
                  </button>
                </div>
                <div className="px-4 pb-3"><p className="text-[9px] text-gray-500 text-center">Powered by{' '}<a href="https://qualiasolutions.net" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold transition-colors">Qualia Solutions</a></p></div>
              </div>
            )}

            {mode === 'ai' && (
              <div className="flex flex-col h-full">
                <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border-b border-gold/20 p-2.5 flex items-center gap-2.5">
                  <button onClick={() => setMode('menu')} className="p-1 hover:bg-black/5 rounded-full transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4 text-gray-500" /></button>
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white border border-gold/30 flex items-center justify-center"><Image src="/aquador-logo.png" alt="Aquad'or" width={36} height={36} className="object-cover" /></div>
                  <div className="flex-1"><h3 className="text-black font-semibold text-sm flex items-center gap-1.5">Aquad{"'"}or<span className="w-1.5 h-1.5 bg-green-500 rounded-full" /></h3><p className="text-[10px] text-gray-400">AI Fragrance Expert</p></div>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors min-[481px]:hidden"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5" role="log" aria-live="polite">
                  {messages.map((message, index) => (<motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-3 py-2 ${message.role === 'user' ? 'bg-gold text-dark' : 'bg-gray-100 text-black border border-gold/10'}`}><p className="text-[13px] whitespace-pre-wrap leading-relaxed">{message.role === 'assistant' ? renderMarkdown(message.content) : message.content}</p></div></motion.div>))}
                  {isLoading && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><div className="bg-gray-100 border border-gold/10 rounded-2xl px-3 py-2 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 text-gold animate-spin" /><span className="text-xs text-gray-400">Thinking...</span></div></motion.div>)}
                  <div ref={messagesEndRef} />
                </div>
                {messages.length <= 2 && (<div className="px-2.5 pb-1.5"><div className="flex flex-wrap gap-1">{suggestions.map((s, i) => (<button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }} className="text-[10px] px-2 py-1 bg-gray-100 border border-gold/20 text-gray-700 rounded-full hover:border-gold hover:text-gold transition-all cursor-pointer">{s}</button>))}</div></div>)}
                <div className="border-t border-gold/20 p-2.5 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Ask about fragrances..." aria-label="Ask about fragrances" disabled={isLoading} className="flex-1 bg-white border border-gold/20 text-black placeholder-gray-500 px-3 py-2 text-sm rounded-xl focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:outline-none transition-colors disabled:opacity-50" />
                    <button onClick={handleSend} disabled={!input.trim() || isLoading} aria-label="Send message" className="bg-gold text-dark p-2 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"><Send className="w-4 h-4" /></button>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1.5 text-center">Powered by{' '}<a href="https://qualiasolutions.net" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold transition-colors">Qualia Solutions</a></p>
                </div>
              </div>
            )}

            {mode === 'live' && (
              <div className="flex flex-col h-full">
                <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border-b border-gold/20 p-2.5 flex items-center gap-2.5">
                  <button onClick={() => setMode('menu')} className="p-1 hover:bg-black/5 rounded-full transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4 text-gray-500" /></button>
                  <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center"><User className="w-5 h-5 text-gold" /></div>
                  <div className="flex-1">
                    <h3 className="text-black font-semibold text-sm flex items-center gap-1.5">Live Chat<span className={`w-1.5 h-1.5 rounded-full ${liveStatus === 'active' ? 'bg-green-500' : liveStatus === 'waiting' ? 'bg-amber-400 animate-pulse' : 'bg-gray-400'}`} /></h3>
                    <p className="text-[10px] text-gray-400">{liveStatus === 'waiting' && 'Waiting for an agent...'}{liveStatus === 'active' && 'Connected to agent'}{liveStatus === 'closed' && 'Chat ended'}</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors min-[481px]:hidden"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5" role="log" aria-live="polite">
                  {liveMessages.map((msg) => (<motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender_type === 'visitor' ? 'justify-end' : msg.sender_type === 'system' ? 'justify-center' : 'justify-start'}`}>{msg.sender_type === 'system' ? (<p className="text-[11px] text-gray-400 italic bg-gray-50 px-3 py-1 rounded-full">{msg.content}</p>) : (<div className={`max-w-[88%] rounded-2xl px-3 py-2 ${msg.sender_type === 'visitor' ? 'bg-gold text-dark' : 'bg-gray-100 text-black border border-gold/10'}`}><p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.content}</p></div>)}</motion.div>))}
                  {liveStatus === 'waiting' && liveMessages.length <= 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4"><div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin text-gold" /><span className="text-xs">Connecting you to an agent...</span></div></motion.div>)}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-gold/20 p-2.5 bg-gray-50">
                  {liveStatus === 'closed' ? (<button onClick={() => { clearSession(); setLiveSession(null); setLiveMessages([]); setLiveStatus('waiting'); startLiveChat(); }} className="w-full py-2 bg-gold text-dark text-sm font-medium rounded-xl hover:bg-gold-light transition-colors cursor-pointer">Start New Chat</button>) : (
                    <div className="flex items-center gap-2">
                      <input ref={liveInputRef} type="text" value={liveInput} onChange={(e) => setLiveInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Type a message..." aria-label="Type a message" maxLength={2000} className="flex-1 bg-white border border-gold/20 text-black placeholder-gray-500 px-3 py-2 text-sm rounded-xl focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:outline-none transition-colors" />
                      <button onClick={handleLiveSend} disabled={!liveInput.trim()} aria-label="Send message" className="bg-gold text-dark p-2 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"><Send className="w-4 h-4" /></button>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-500 mt-1.5 text-center">Powered by{' '}<a href="https://qualiasolutions.net" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold transition-colors">Qualia Solutions</a></p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes chat-toggle-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(212, 175, 55, 0.5); }
        }
        .chat-toggle-btn:not([data-open="true"]) {
          animation: chat-toggle-glow 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .chat-toggle-btn { animation: none !important; }
        }
      `}</style>
    </>
  );
}

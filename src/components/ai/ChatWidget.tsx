'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Parse markdown to React elements (bold and links)
function renderMarkdown(text: string) {
  const parts: (string | JSX.Element)[] = [];
  let keyIndex = 0;

  // Combined regex for links and bold
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Link: [text](url)
      const linkText = match[1];
      const url = match[2];
      parts.push(
        <Link
          key={`link-${keyIndex++}`}
          href={url}
          className="text-gold hover:text-gold-light underline underline-offset-2"
        >
          {linkText}
        </Link>
      );
    } else if (match[3]) {
      // Bold: **text**
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold">
          {match[3]}
        </strong>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to Aquad'or! How can I help you find your perfect scent?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again or [contact us](/contact).",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Jasmine scents",
    "Woody fragrances",
    "For men",
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-br from-gold to-gold-light rounded-full shadow-xl flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isOpen
            ? '0 4px 20px rgba(212, 175, 55, 0.3)'
            : [
                '0 4px 20px rgba(212, 175, 55, 0.3)',
                '0 4px 30px rgba(212, 175, 55, 0.5)',
                '0 4px 20px rgba(212, 175, 55, 0.3)',
              ],
        }}
        transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-dark" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6 text-dark" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-gold" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="chat-window fixed z-50 bg-dark border border-gold/20 shadow-2xl flex flex-col overflow-hidden
              bottom-20 right-4 w-[320px] h-[420px] rounded-2xl
              max-[480px]:bottom-0 max-[480px]:right-0 max-[480px]:left-0 max-[480px]:w-full max-[480px]:h-[100dvh] max-[480px]:rounded-none"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border-b border-gold/20 p-2.5 flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-dark border border-gold/30 flex items-center justify-center">
                <Image
                  src="/aquador.webp"
                  alt="Aquad'or"
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                  Aquad{"'"}or
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                </h3>
                <p className="text-[10px] text-gray-400">Fragrance Expert</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors min-[481px]:hidden"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-gold text-dark'
                        : 'bg-dark-lighter text-white border border-gold/10'
                    }`}
                  >
                    <p className="text-[13px] whitespace-pre-wrap leading-relaxed">
                      {message.role === 'assistant'
                        ? renderMarkdown(message.content)
                        : message.content
                      }
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-dark-lighter border border-gold/10 rounded-2xl px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-gold animate-spin" />
                    <span className="text-xs text-gray-400">Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-2.5 pb-1.5">
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="text-[10px] px-2 py-1 bg-dark-lighter border border-gold/20 text-gray-300 rounded-full hover:border-gold hover:text-gold transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gold/20 p-2.5 bg-dark-lighter">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about fragrances..."
                  disabled={isLoading}
                  className="flex-1 bg-dark border border-gold/20 text-white placeholder-gray-500 px-3 py-2 text-sm rounded-xl focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gold text-dark p-2 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-gray-500 mt-1.5 text-center">
                Powered by{' '}
                <a
                  href="https://qualiasolutions.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold/70 hover:text-gold transition-colors"
                >
                  Qualia Solutions
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

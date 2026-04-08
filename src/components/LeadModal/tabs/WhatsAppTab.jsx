import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Send } from 'lucide-react';
import { getMessages, sendMessage, normalisePhone } from '../../../services/whatsapp';
import { formatMessageTime } from '../helpers';

// ── WhatsApp text formatter (bold markers) ──
function MessageText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/(\*[^*]+\*)/g);
        return (
          <span key={li}>
            {parts.map((part, pi) =>
              part.startsWith('*') && part.endsWith('*')
                ? <strong key={pi}>{part.slice(1, -1)}</strong>
                : <span key={pi}>{part}</span>
            )}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

export function WhatsAppTab({ phone }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const sendInFlightRef = useRef(false);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!phone) return;
    if (silent && sendInFlightRef.current) return;

    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const normPhone = normalisePhone(phone);
      const data = await getMessages(normPhone);
      const filtered = data.filter(m =>
        m.message_text && m.message_text.trim() !== '' && m.message_type !== 'session'
      );
      setMessages(filtered);
    } catch (err) {
      console.error('Failed to load WhatsApp messages:', err);
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [phone]);

  // Load messages and poll
  useEffect(() => {
    if (!phone) return;
    fetchMessages(false);
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);
  }, [phone, fetchMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !phone || sending) return;

    const normPhone = normalisePhone(phone);
    sendInFlightRef.current = true;

    // Optimistic UI
    const optimisticMsg = {
      message_id: `optimistic-${Date.now()}`,
      phone: normPhone,
      direction: 'OUT',
      message_type: 'text',
      message_text: text,
      status: 'sending',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setMessageText('');
    setSending(true);

    try {
      await sendMessage(normPhone, text);
      setTimeout(() => {
        sendInFlightRef.current = false;
        fetchMessages(true);
      }, 3000);
    } catch (err) {
      sendInFlightRef.current = false;
      console.error('Failed to send WhatsApp message:', err);
      setMessages(prev => prev.filter(m => m.message_id !== optimisticMsg.message_id));
      setMessageText(text);
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100% - 0px)' }}>
      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-3 rounded-lg mb-3"
        style={{
          backgroundColor: '#EFEAE2',
          backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
          backgroundRepeat: 'repeat',
          backgroundBlendMode: 'overlay',
          minHeight: '300px',
        }}
      >
        <div className="space-y-2">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="bg-white/80 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 text-[#25D366] animate-spin" />
                <span className="text-sm text-[#667781]">Loading messages...</span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-3 mx-auto max-w-sm text-center">
              <p className="text-sm text-red-700">Failed to load messages</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex justify-center">
              <div className="bg-white/80 rounded-lg px-4 py-2 text-sm text-[#667781] shadow-sm">
                {phone ? 'No messages yet' : 'No phone number available for this lead'}
              </div>
            </div>
          )}

          {!loading && messages.map((msg) => {
            const isOut = msg.direction === 'OUT';
            return (
              <div
                key={msg.message_id}
                className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-2.5 py-1.5 shadow-sm ${isOut ? 'bg-[#D9FDD3] text-[#111B21]' : 'bg-white text-[#111B21]'}`}
                  style={{
                    borderRadius: isOut ? '8px 8px 0px 8px' : '8px 8px 8px 0px',
                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                  }}
                >
                  <p className="text-sm leading-[1.45]">
                    <MessageText text={msg.message_text} />
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[#667781] text-[11px]">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                    {isOut && (
                      <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                        <path
                          d="M11.071 0.5L5.5 6.071l-2.071-2.07L2 5.429 5.5 8.929 12.5 1.929 11.071 0.5zM14.5 1.929L7.5 8.929l-2 2L4 8.429l1.429-1.429 1.071 1.071L13.071 0.5 14.5 1.929z"
                          fill={msg.status === 'read' ? '#53BDEB' : '#8696A0'}
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="flex gap-2 items-end pt-2 border-t border-border">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            disabled={sending || !phone}
            className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] h-[42px]"
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !messageText.trim() || !phone}
          className="p-2.5 bg-foreground text-background cursor-pointer rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed h-[42px] w-[42px] flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

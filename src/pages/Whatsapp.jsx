import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Send, Loader2, RefreshCw } from 'lucide-react';
import { getContacts, getMessages, sendMessage, syncChats } from '../services/whatsapp';
import whatsappLogo from '../assets/whatsapp -logo.png';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Format ISO timestamp → human-readable time or date */
function formatMessageTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

/** Format ISO timestamp for chat list → "HH:MM" if today, else "Mon DD" */
function formatContactTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { weekday: 'short' });
}

/** Generate initials avatar text from a name or phone */
function getAvatar(nameOrPhone) {
  if (!nameOrPhone) return '?';
  const trimmed = nameOrPhone.trim();
  // If it looks like a number → use last 2 digits
  if (/^\d+$/.test(trimmed)) return trimmed.slice(-2);
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

/** Render message text — converts *bold* markdown and newlines to JSX */
function MessageText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <span>
      {lines.map((line, li) => {
        // Split on *bold* markers
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

// ─── Main Component ──────────────────────────────────────────────────────────

function WhatsAppAutomation() {
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState(null);

  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const messagesEndRef = useRef(null);

  // ── Contacts fetch (also used by auto-poll) ────────────────────────────
  const fetchContacts = useCallback(async (silent = false) => {
    if (!silent) setContactsLoading(true);
    setContactsError(null);
    try {
      console.log('[Whatsapp] Fetching contacts...');
      const data = await getContacts();
      console.log('[Whatsapp] Contacts loaded:', data.length, 'contacts');
      setContacts(data);
    } catch (err) {
      console.error('[Whatsapp] Failed to load contacts:', err.message);
      setContactsError(err.message);
    } finally {
      if (!silent) setContactsLoading(false);
    }
  }, []);

  // ── Load contacts on mount + poll every 30 s ────────────────────────────
  useEffect(() => {
    fetchContacts(false);
    const id = setInterval(() => {
      console.log('[Whatsapp] Auto-polling contacts (30 s interval)...');
      fetchContacts(true);
    }, 30_000);
    return () => clearInterval(id);
  }, [fetchContacts]);

  // ── Messages fetch (also used by auto-poll) ────────────────────────────
  const fetchMessages = useCallback(async (contact, silent = false) => {
    if (!contact) return;
    if (!silent) { setMessagesLoading(true); setMessagesError(null); setMessages([]); }
    try {
      console.log('[Whatsapp] Fetching messages for phone:', contact.phone, silent ? '(poll)' : '(initial)');
      const data = await getMessages(contact.phone);
      console.log('[Whatsapp] Messages loaded:', data.length, 'for', contact.phone);
      const filtered = data.filter(m => m.message_type === 'text' || (m.message_type === 'template' && m.message_text));
      console.log('[Whatsapp] After filter:', filtered.length);
      setMessages(filtered);
    } catch (err) {
      console.error('[Whatsapp] Failed to load messages:', err.message);
      if (!silent) setMessagesError(err.message);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }, []);

  // ── Load messages on contact select + poll every 15 s ──────────────────
  useEffect(() => {
    if (!selectedContact) return;
    fetchMessages(selectedContact, false);
    const id = setInterval(() => {
      console.log('[Whatsapp] Auto-polling messages (15 s interval) for:', selectedContact.phone);
      fetchMessages(selectedContact, true);
    }, 15_000);
    return () => clearInterval(id);
  }, [selectedContact, fetchMessages]);

  // ── Scroll to bottom when messages update ───────────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ── Filtered contacts by search ─────────────────────────────────────────
  const filteredContacts = contacts.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query)
    );
  });

  const handleSelectContact = (contact) => {
    console.log('[Whatsapp] Contact selected:', contact.phone, '| name:', contact.name);
    setSelectedContact(contact);
    setShowDropdown(false);
  };

  // ── Send session message ──────────────────────────────────────────
  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text || !selectedContact || isSending) return;

    console.log('[Whatsapp] handleSendMessage → phone:', selectedContact.phone, '| message:', text);

    // Optimistic UI: add bubble immediately so it feels instant
    const optimisticMsg = {
      message_id: `optimistic-${Date.now()}`,
      phone: selectedContact.phone,
      direction: 'OUT',
      message_type: 'text',
      message_text: text,
      status: 'sending',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setMessage(''); // clear input right away
    setIsSending(true);

    try {
      await sendMessage(selectedContact.phone, text);
      console.log('[Whatsapp] sendMessage success — bubble confirmed');
      // The next auto-poll (15 s) will replace the optimistic msg with the real one from server.
      // Optionally force an immediate refresh:
      fetchMessages(selectedContact, true);
    } catch (err) {
      console.error('[Whatsapp] sendMessage failed:', err.message);
      // Remove the optimistic bubble and restore the input text
      setMessages(prev => prev.filter(m => m.message_id !== optimisticMsg.message_id));
      setMessage(text);
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // ── Sync old chat ─────────────────────────────────────────────────
  const handleSyncChat = async () => {
    if (!selectedContact || syncLoading) return;

    console.log('[Whatsapp] handleSyncChat → triggered for phone:', selectedContact.phone);
    setSyncLoading(true);
    try {
      await syncChats(selectedContact.phone);
      console.log('[Whatsapp] syncChats success — refreshing messages...');
      // Reload messages after sync to show newly pulled history
      await fetchMessages(selectedContact, false);
    } catch (err) {
      console.error('[Whatsapp] syncChats failed:', err.message);
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">

      {/* ── Left: Contact List Sidebar ───────────────────────────────── */}
      <div className="w-[360px] bg-white border-r border-[#E9EDEF] flex flex-col flex-shrink-0">

        {/* Search */}
        <div className="p-2 bg-white border-b border-[#E9EDEF]">
          <div className="bg-[#F0F2F5] rounded-lg px-4 py-2 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#54656F] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-[#3B4A54] outline-none flex-1 placeholder:text-[#667781]"
            />
          </div>
        </div>

        {/* Contact list body */}
        <div className="flex-1 overflow-y-auto bg-white">

          {/* Loading state */}
          {contactsLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-[#25D366] animate-spin" />
              <p className="text-sm text-[#667781]">Loading contacts...</p>
            </div>
          )}

          {/* Error state */}
          {!contactsLoading && contactsError && (
            <div className="p-4 m-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Failed to load contacts</p>
              <p className="text-xs text-red-500 mt-1">{contactsError}</p>
            </div>
          )}

          {/* Empty state */}
          {!contactsLoading && !contactsError && filteredContacts.length === 0 && (
            <div className="p-8 text-center text-[#667781] text-sm">
              {searchQuery ? 'No contacts match your search' : 'No contacts found'}
            </div>
          )}

          {/* Contact rows */}
          {!contactsLoading && filteredContacts.map((contact) => {
            const isSelected = selectedContact?.phone === contact.phone;
            const isInbound = contact.last_message_direction === 'IN';

            return (
              <div
                key={contact.phone}
                onClick={() => handleSelectContact(contact)}
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer border-b border-[#F0F2F5] transition-colors ${isSelected ? 'bg-[#F0F2F5]' : 'hover:bg-[#F5F6F6]'}`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-[#D1D7DB] rounded-full flex items-center justify-center text-[#54656F] font-medium flex-shrink-0 text-sm">
                  {getAvatar(contact.name)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    {/* Name = phone number from API */}
                    <h3 className="text-[#111B21] font-medium truncate text-sm">
                      {contact.name || contact.phone}
                    </h3>
                    <span className="text-[#667781] text-xs flex-shrink-0 ml-2">
                      {formatContactTime(contact.last_message_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[#667781] text-xs truncate">
                      {isInbound ? '' : '✓ '}{contact.last_message_text || ''}
                    </p>
                    {contact.unread_count > 0 && (
                      <span className="bg-[#25D366] text-white rounded-full flex items-center justify-center font-medium w-5 h-5 text-xs flex-shrink-0">
                        {contact.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Chat Area ─────────────────────────────────────────── */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col min-w-0">

          {/* Chat Header */}
          <div className="h-[60px] bg-[#F0F2F5] px-4 flex items-center justify-between border-b border-[#E9EDEF] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D1D7DB] rounded-full flex items-center justify-center text-[#54656F] font-medium text-sm flex-shrink-0">
                {getAvatar(selectedContact.name)}
              </div>
              <div>
                <h3 className="text-[#111B21] font-medium text-base leading-tight">
                  {selectedContact.name || selectedContact.phone}
                </h3>
                <p className="text-[#667781] text-xs">{selectedContact.phone}</p>
              </div>
            </div>

            {/* Chat Header Actions */}
            <div className="flex items-center gap-2">

              {/* Sync Old Chat */}
              <button
                onClick={handleSyncChat}
                disabled={syncLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                {syncLoading ? 'Syncing...' : 'Sync Old Chat'}
              </button>

              {/* Send Status to Meta dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-[#E2E8F0] rounded-md text-sm text-[#3B4A54] bg-white hover:bg-[#F5F6F6] transition-colors cursor-pointer"
                >
                  <span>Send Status to Meta</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 top-12 bg-white rounded-md shadow-lg border border-[#E9EDEF] py-2 w-48 z-20">
                      {['Contacted', 'Qualified', 'Converted'].map((status) => (
                        <button
                          key={status}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#3B4A54] cursor-pointer hover:bg-[#F5F6F6] transition-colors"
                          onClick={() => {
                            console.log('[Whatsapp] Send Status to Meta:', status, '| contact:', selectedContact.phone);
                            setShowDropdown(false);
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div> {/* end flex actions */}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 relative" style={{ backgroundColor: '#EFEAE2' }}>
            {/* WhatsApp background pattern */}
            <div
              className="absolute inset-0"
              style={{
                opacity: 0.4,
                backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                backgroundRepeat: 'repeat',
              }}
            />

            <div className="relative space-y-2">

              {/* Messages loading */}
              {messagesLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="bg-white/80 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-4 h-4 text-[#25D366] animate-spin" />
                    <span className="text-sm text-[#667781]">Loading messages...</span>
                  </div>
                </div>
              )}

              {/* Messages error */}
              {!messagesLoading && messagesError && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3 mx-auto max-w-sm text-center">
                  <p className="text-sm text-red-700">Failed to load messages</p>
                  <p className="text-xs text-red-500 mt-1">{messagesError}</p>
                </div>
              )}

              {/* No messages */}
              {!messagesLoading && !messagesError && messages.length === 0 && (
                <div className="flex justify-center">
                  <div className="bg-white/80 rounded-lg px-4 py-2 text-sm text-[#667781] shadow-sm">
                    No messages yet
                  </div>
                </div>
              )}

              {/* Message bubbles */}
              {!messagesLoading && messages.map((msg) => {
                const isOut = msg.direction === 'OUT';
                return (
                  <div
                    key={msg.message_id}
                    className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[65%] px-2.5 py-1.5 shadow-sm ${isOut ? 'bg-[#D9FDD3] text-[#111B21]' : 'bg-white text-[#111B21]'}`}
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
                        {/* Double-tick for outbound messages */}
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

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-[#F0F2F5] px-4 py-3 flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder="Type a message"
              className="flex-1 bg-white text-[#3B4A54] px-4 py-2.5 rounded-lg outline-none placeholder:text-[#667781] border border-transparent focus:border-[#E9EDEF] text-sm"
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              className="p-2 cursor-pointer hover:bg-[#E9EDEF] disabled:opacity-40 rounded-full transition-colors"
            >
              <Send className="w-5 h-5 text-[#54656F]" />
            </button>
          </div>
        </div>

      ) : (
        /* Empty state — no contact selected */
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5]">
          <div className="max-w-[480px] text-center space-y-5 px-4">
            <img
              src={whatsappLogo}
              alt="WhatsApp Logo"
              className="mx-auto w-[60px] h-[60px] object-contain"
            />
            <h1 className="text-[#111B21] text-2xl font-light">
              WhatsApp for Your Business
            </h1>
            <p className="text-[#667781] text-sm leading-6">
              Select a contact from the sidebar to view the conversation history and manage your leads.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsAppAutomation;

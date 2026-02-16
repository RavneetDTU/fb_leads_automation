import { useState } from 'react';
import { Search, ChevronDown, Smile, Paperclip, Mic, Send, MessageCircle } from 'lucide-react';
import whatsappLogo from '../assets/whatsapp -logo.png';

const mockChats = [
  {
    id: 1,
    name: 'Sarah Johnson',
    lastMessage: 'Yes, I am interested in the Enterprise plan',
    time: '14:32',
    unread: 2,
    avatar: 'SJ',
  },
  {
    id: 2,
    name: 'Michael Chen',
    lastMessage: 'Can you send me more details?',
    time: '13:15',
    unread: 0,
    avatar: 'MC',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    lastMessage: 'Thank you for reaching out',
    time: '12:48',
    unread: 1,
    avatar: 'ER',
  },
  {
    id: 4,
    name: 'David Kim',
    lastMessage: 'What are the pricing options?',
    time: '11:22',
    unread: 0,
    avatar: 'DK',
  },
  {
    id: 5,
    name: 'Jessica Taylor',
    lastMessage: 'Perfect, thank you!',
    time: '10:05',
    unread: 0,
    avatar: 'JT',
  },
  {
    id: 6,
    name: 'Robert Wilson',
    lastMessage: 'When can we schedule a call?',
    time: 'Yesterday',
    unread: 0,
    avatar: 'RW',
  },
];

const mockMessages = [
  {
    id: 1,
    text: 'Hi Sarah! Thank you for your interest in our Summer Sale 2024 campaign.',
    sent: true,
    time: '14:28',
  },
  {
    id: 2,
    text: 'Hello! Yes, I saw your ad on Facebook.',
    sent: false,
    time: '14:30',
  },
  {
    id: 3,
    text: 'Great! Would you like to learn more about our Enterprise plan?',
    sent: true,
    time: '14:31',
  },
  {
    id: 4,
    text: 'Yes, I am interested in the Enterprise plan',
    sent: false,
    time: '14:32',
  },
];

function WhatsAppAutomation() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex h-screen bg-white">
      {/* Chat List Sidebar */}
      <div className="w-[380px] bg-white border-r border-[#E9EDEF] flex flex-col">
        {/* Header */}


        {/* Search */}
        <div className="p-2 bg-white">
          <div className="bg-[#F0F2F5] rounded-lg px-4 py-2 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#54656F]" />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="bg-transparent text-sm text-[#3B4A54] outline-none flex-1 placeholder:text-[#667781]"
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer border-b border-[#F0F2F5] ${selectedChat?.id === chat.id ? 'bg-[#F0F2F5]' : 'hover:bg-[#F5F6F6]'
                }`}
            >
              <div className="w-12 h-12 bg-[#D1D7DB] rounded-full flex items-center justify-center text-[#54656F] font-medium flex-shrink-0 text-sm">
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[#111B21] font-medium truncate" style={{ fontSize: '14px' }}>{chat.name}</h3>
                  <span className="text-[#667781]" style={{ fontSize: '14px' }}>{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#667781] truncate" style={{ fontSize: '14px' }}>{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="bg-[#25D366] text-white rounded-full flex items-center justify-center font-medium w-5 h-5" style={{ fontSize: '14px' }}>
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-[60px] bg-[#F0F2F5] px-4 flex items-center justify-between border-b border-[#E9EDEF]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D1D7DB] rounded-full flex items-center justify-center text-[#54656F] font-medium text-sm">
                {selectedChat.avatar}
              </div>
              <div>
                <h3 className="text-[#111B21] font-medium" style={{ fontSize: '16px' }}>{selectedChat.name}</h3>
                <p className="text-[#667781]" style={{ fontSize: '14px' }}>online</p>
              </div>
            </div>
            <div className="flex items-center pr-4">
              <div className="relative">
                {/* Send Status to Meta Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-[#E2E8F0] rounded-md text-sm text-[#3B4A8] bg-white hover:bg-[#F5F6F6] transition-colors cursor-pointer"
                >
                  <span>Send Status to Meta</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute right-0 top-12 bg-white rounded-md shadow-lg border border-[#E9EDEF] py-2 w-48 z-20">
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-[#3B4A54] cursor-pointer hover:bg-[#F5F6F6] transition-colors"
                        onClick={() => {
                          console.log('Status: Contacted');
                          setShowDropdown(false);
                        }}
                      >
                        Contacted
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-[#3B4A54] cursor-pointer hover:bg-[#F5F6F6] transition-colors"
                        onClick={() => {
                          console.log('Status: Qualified');
                          setShowDropdown(false);
                        }}
                      >
                        Qualified
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-[#3B4A54] cursor-pointer hover:bg-[#F5F6F6] transition-colors"
                        onClick={() => {
                          console.log('Status: Converted');
                          setShowDropdown(false);
                        }}
                      >
                        Converted
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area with WhatsApp Light Background */}
          <div className="flex-1 overflow-y-auto p-6 relative" style={{ backgroundColor: '#EFEAE2' }}>
            {/* WhatsApp Light Theme Background Pattern */}
            <div
              className="absolute inset-0"
              style={{
                opacity: 0.4,
                backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                backgroundRepeat: 'repeat',
              }}
            />

            <div className="relative space-y-2">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[65%] rounded-lg px-2 py-1 shadow-sm ${msg.sent
                      ? 'bg-[#D9FDD3] text-[#111B21]'
                      : 'bg-white text-[#111B21]'
                      }`}
                    style={{
                      borderRadius: msg.sent ? '8px 8px 0px 8px' : '8px 8px 8px 0px',
                      boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                    }}
                  >
                    <p className="leading-5" style={{ fontSize: '14px' }}>{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt">
                      <span className="text-[#667781]" style={{ fontSize: '12px' }}>{msg.time}</span>
                      {msg.sent && (
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" className="ml-1">
                          <path d="M11.071 0.5L5.5 6.071l-2.071-2.07L2 5.429 5.5 8.929 12.5 1.929 11.071 0.5zM14.5 1.929L7.5 8.929l-2 2L4 8.429l1.429-1.429 1.071 1.071L13.071 0.5 14.5 1.929z" fill="#53BDEB" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-[#F0F2F5] px-4 py-3 flex items-center gap-2">
            {/* <button className="p-2 hover:bg-[#E9EDEF] rounded-full transition-colors">
              <Smile className="w-6 h-6 text-[#54656F]" />
            </button> */}
            {/* <button className="p-2 hover:bg-[#E9EDEF] rounded-full transition-colors">
              <Paperclip className="w-6 h-6 text-[#54656F]" />
            </button> */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 bg-white text-[#3B4A54] px-4 py-2.5 rounded-lg outline-none placeholder:text-[#667781] border border-transparent focus:border-[#E9EDEF]"
              style={{ fontSize: '14px' }}
            />

            {/*send button*/}
            <button className="p-2 cursor-pointer hover:bg-[#E9EDE2] rounded-full transition-colors">
              <Send className="w-6 h-6 text-[#54656F5]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5]">
          <div className="max-w-[560px] text-center space-y-8 px-4">
            <div className="mx-auto mb-5">
              {/* WhatsApp Logo */}
              <img
                src={whatsappLogo}
                alt="WhatsApp Logo"
                className=" mx-auto w-[60px] h-[60px] object-contain"
              />
            </div>

            <h1 className="text-[#41525] text-[28px] font-light mb-4">
              WhatsApp for Your Business
            </h1>

            <p className="text-[#667781] text-[14px] leading-6 max-w-[90%] mx-auto">
              Streamline your lead management with seamless WhatsApp integration. Engage with clients instantly, track conversations in real-time, and close deals faster.
            </p>
          </div>

          <div className="absolute bottom-10 flex items-center gap-2 text-[#8696A0] text-[13px]">
            {/* <svg viewBox="0 0 10 12" width="10" height="12" fill="currentColor">
              <path d="M5.008 1.6c1.328 0 2.628.272 3.76.786v-1.16A4.966 4.966 0 0 0 5.008 0C2.25 0 0 2.25 0 5.008c0 1.25.463 2.392 1.22 3.272l1.64-1.574A2.736 2.736 0 0 1 2.228 5.01c0-1.536 1.244-2.78 2.78-2.78 1.536 0 2.78 1.244 2.78 2.78 0 .866-.398 1.636-1.026 2.148l1.64 1.573A4.977 4.977 0 0 0 10.016 5.01c0-2.758-2.25-5.01-5.008-5.01zm0 4.14a.868.868 0 1 0 0 1.734.868.868 0 0 0 0-1.734zM5.02 8.35c.983 0 1.868-.426 2.478-1.106l-1.66-1.55a1.134 1.134 0 0 0-.82-.354c-.63 0-1.14.51-1.14 1.14 0 .313.13.595.337.8L2.592 8.92A3.333 3.333 0 0 1 1.688 6.71c0-1.84 1.492-3.332 3.332-3.332s3.332 1.492 3.332 3.332c0 1.24-.68 2.327-1.693 2.91L5.02 8.35z"></path>
            </svg> */}
            {/* <span>Your personal messages are end-to-end encrypted</span> */}
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsAppAutomation;

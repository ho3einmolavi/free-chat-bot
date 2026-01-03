import { useState, useEffect } from 'react';
import OnlineUsers from './OnlineUsers';
import ChatWindow from './ChatWindow';
import StartChatModal from './StartChatModal';

function ChatLayout({ 
  user, 
  onLogout, 
  connected, 
  authenticated, 
  onlineUsers, 
  currentChat,
  messages,
  typingUser,
  error,
  startChat,
  sendMessage,
  sendTyping,
  closeChat,
  clearError
}) {
  const [showStartChat, setShowStartChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

  // Close sidebar when chat is selected on mobile
  const handleStartChat = (username) => {
    startChat(username);
    setShowStartChat(false);
    setSidebarOpen(false);
  };

  // Close sidebar when clicking back on mobile
  const handleCloseChat = () => {
    closeChat();
    setSidebarOpen(true); // Show sidebar when closing chat on mobile
  };

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  return (
    <div className="h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-64 md:w-96 h-64 md:h-96 bg-neon-purple/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-64 md:w-96 h-64 md:h-96 bg-neon-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-2 left-2 right-2 md:top-4 md:right-4 md:left-auto z-50 animate-slide-in-right">
          <div className="glass-strong rounded-xl p-3 md:p-4 pr-10 md:pr-12 md:max-w-sm border border-red-500/30">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-xs md:text-sm text-red-300">{error}</p>
            </div>
            <button 
              onClick={clearError}
              className="absolute top-2.5 right-2.5 md:top-3 md:right-3 p-1 text-midnight-400 hover:text-midnight-200 touch-target"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`
          fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 md:hidden
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40
        w-[85vw] max-w-xs md:w-80
        h-full
        glass-strong border-r border-white/5
        flex flex-col
        transition-transform duration-300 ease-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-white/5 pt-safe">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-midnight-100 text-sm md:text-base truncate">{user?.username}</p>
                <p className="text-xs text-midnight-400 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${connected && authenticated ? 'bg-neon-green' : 'bg-yellow-500 animate-pulse'}`} />
                  <span className="truncate">{connected && authenticated ? 'Online' : 'Connecting...'}</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 text-midnight-400 hover:text-midnight-200 transition-colors touch-target flex-shrink-0"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3 md:p-4">
          <button
            onClick={() => setShowStartChat(true)}
            className="w-full py-3 md:py-3.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue font-medium text-sm md:text-base hover:shadow-lg hover:shadow-neon-purple/20 active:scale-[0.98] transition-all touch-target"
          >
            + New Chat
          </button>
        </div>

        {/* Online Users */}
        <OnlineUsers 
          users={onlineUsers} 
          onSelectUser={handleStartChat}
          currentPartner={currentChat?.partner}
        />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full min-w-0">
        {currentChat ? (
          <ChatWindow
            partner={currentChat.partner}
            isOnline={onlineUsers.some(u => u.username === currentChat.partner && u.isOnline)}
            messages={messages}
            typingUser={typingUser}
            currentUser={user?.username}
            onSendMessage={sendMessage}
            onTyping={sendTyping}
            onClose={handleCloseChat}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Mobile Header when no chat */}
            <header className="flex items-center gap-3 p-3 md:p-4 glass-strong border-b border-white/5 md:hidden pt-safe">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 text-midnight-300 transition-colors touch-target"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-midnight-100">Messages</h1>
            </header>

            {/* Empty State */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center animate-fade-in max-w-sm">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-2xl md:rounded-3xl glass flex items-center justify-center">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-midnight-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-midnight-200 mb-2">No conversation selected</h2>
                <p className="text-sm md:text-base text-midnight-400 mb-4 md:mb-6">
                  <span className="hidden md:inline">Select a user from the sidebar or start a new chat</span>
                  <span className="md:hidden">Tap the menu to see online users or start a new chat</span>
                </p>
                <button
                  onClick={() => setShowStartChat(true)}
                  className="px-5 py-3 md:px-6 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink font-medium text-sm md:text-base hover:shadow-lg hover:shadow-neon-purple/30 active:scale-[0.98] transition-all touch-target"
                >
                  Start a Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Start Chat Modal */}
      {showStartChat && (
        <StartChatModal
          onClose={() => setShowStartChat(false)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}

export default ChatLayout;

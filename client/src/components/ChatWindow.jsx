import { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';

function ChatWindow({ 
  partner, 
  isOnline, 
  messages, 
  typingUser, 
  currentUser, 
  onSendMessage,
  onSendImage,
  onTyping,
  onClose,
  onOpenSidebar
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <header className="flex items-center gap-2 md:gap-4 p-2.5 md:p-4 glass-strong border-b border-white/5 pt-safe">
        {/* Menu button - mobile only */}
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 text-midnight-400 hover:text-midnight-200 transition-colors md:hidden touch-target"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Back button - mobile only */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 text-midnight-400 hover:text-midnight-200 transition-colors md:hidden touch-target"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-bold text-base md:text-lg">
            {partner[0].toUpperCase()}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-midnight-950 ${isOnline ? 'bg-neon-green' : 'bg-midnight-500'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-midnight-100 text-base md:text-lg truncate">{partner}</h2>
          <p className={`text-xs md:text-sm truncate ${isOnline ? 'text-neon-green' : 'text-midnight-400'}`}>
            {typingUser === partner ? (
              <span className="flex items-center gap-1">
                <span className="animate-typing">typing</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>
            ) : (
              isOnline ? 'Online' : 'Offline'
            )}
          </p>
        </div>

        <button
          onClick={onClose}
          className="hidden md:flex p-2 rounded-lg hover:bg-white/5 text-midnight-400 hover:text-midnight-200 transition-colors touch-target"
          title="Close chat"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6 scroll-touch"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center animate-fade-in px-4">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-midnight-300 text-sm md:text-base">No messages yet</p>
              <p className="text-xs md:text-sm text-midnight-500 mt-1">Say hello to start the conversation!</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center gap-3 md:gap-4 my-3 md:my-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-midnight-700 to-transparent" />
                <span className="text-[10px] md:text-xs text-midnight-500 font-medium px-2">{date}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-midnight-700 to-transparent" />
              </div>

              {/* Messages */}
              <div className="space-y-2 md:space-y-3">
                {dateMessages.map((message, index) => {
                  const isOwn = message.from === currentUser;
                  const isImage = message.type === 'image';
                  return (
                    <div
                      key={message.id || index}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    >
                      <div className={`
                        max-w-[85%] md:max-w-[70%] lg:max-w-[60%]
                        ${isOwn 
                          ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-2xl rounded-br-md' 
                          : 'glass-strong text-midnight-100 rounded-2xl rounded-bl-md'
                        }
                        ${isImage ? 'p-1.5 md:p-2' : 'px-3 py-2 md:px-4 md:py-3'}
                      `}>
                        {isImage ? (
                          <img 
                            src={message.imageData} 
                            alt="Shared image"
                            className="rounded-xl max-h-64 md:max-h-80 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.imageData, '_blank')}
                          />
                        ) : (
                          <p className="break-words whitespace-pre-wrap text-sm md:text-base">{message.text}</p>
                        )}
                        <p className={`text-[10px] md:text-xs mt-1 ${isImage ? 'px-1' : ''} ${isOwn ? 'text-white/60' : 'text-midnight-400'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUser === partner && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass px-3 py-2 md:px-4 md:py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} onSendImage={onSendImage} onTyping={onTyping} />
    </div>
  );
}

export default ChatWindow;

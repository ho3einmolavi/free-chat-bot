import { useState, useRef, useEffect } from 'react';

function MessageInput({ onSendMessage, onTyping }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Focus input on mount (only on desktop)
    if (window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, []);

  const handleTyping = (value) => {
    setMessage(value);

    // Send typing indicator
    if (!isTyping && value) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 1.5 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmed = message.trim();
    if (!trimmed) return;
    
    if (trimmed.length > 1000) {
      return; // Message too long
    }

    onSendMessage(trimmed);
    setMessage('');
    setIsTyping(false);
    onTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2.5 md:p-4 glass-strong border-t border-white/5 pb-safe">
      <div className="flex items-end gap-2 md:gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="
              w-full px-3 py-2.5 pr-10 md:px-4 md:py-3 md:pr-12
              bg-midnight-950/50 border border-midnight-700/50 rounded-xl
              focus:border-neon-purple focus:outline-none
              text-midnight-100 placeholder-midnight-500
              resize-none max-h-28 md:max-h-32
              transition-colors duration-200
              text-sm md:text-base
            "
            style={{ 
              minHeight: '42px',
              height: message.includes('\n') ? 'auto' : '42px'
            }}
          />
          
          {/* Character count */}
          {message.length > 900 && (
            <span className={`absolute right-2 bottom-2 md:right-3 md:bottom-3 text-[10px] md:text-xs ${message.length > 1000 ? 'text-red-400' : 'text-midnight-500'}`}>
              {message.length}/1000
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!message.trim() || message.length > 1000}
          className={`
            w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0
            transition-all duration-200 touch-target
            ${message.trim() && message.length <= 1000
              ? 'bg-gradient-to-r from-neon-purple to-neon-pink hover:shadow-lg hover:shadow-neon-purple/30 active:scale-95'
              : 'bg-midnight-800/50 text-midnight-500 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <p className="hidden md:block text-xs text-midnight-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}

export default MessageInput;

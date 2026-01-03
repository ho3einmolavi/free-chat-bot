import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

function StartChatModal({ onClose, onStartChat }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      // Check if user exists
      const res = await fetch(`${API_URL}/api/users/check/${trimmed}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid username');
        setLoading(false);
        return;
      }

      if (!data.exists) {
        setError('User not found. They must login first to receive messages.');
        setLoading(false);
        return;
      }

      onStartChat(data.username);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full md:max-w-md glass-strong rounded-t-2xl md:rounded-2xl p-4 md:p-6 animate-slide-up pb-safe">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 text-midnight-400 hover:text-midnight-200 transition-colors touch-target"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Drag handle for mobile */}
        <div className="md:hidden w-10 h-1 bg-midnight-600 rounded-full mx-auto mb-4" />

        <div className="text-center mb-4 md:mb-6">
          <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center">
            <svg className="w-6 h-6 md:w-7 md:h-7 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-midnight-100">Start New Chat</h2>
          <p className="text-xs md:text-sm text-midnight-400 mt-1">Enter the username to message</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            placeholder="Enter username..."
            autoFocus
            maxLength={20}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-midnight-950/50 border-2
              ${error ? 'border-red-500/50' : 'border-midnight-700/50'}
              focus:border-neon-purple focus:outline-none
              text-base text-midnight-100 placeholder-midnight-500
              transition-colors duration-200
            `}
          />

          {error && (
            <p className="mt-2 text-xs md:text-sm text-red-400 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}

          <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-midnight-600 text-midnight-300 hover:bg-white/5 active:bg-white/10 transition-colors text-sm md:text-base touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className={`
                flex-1 py-3 rounded-xl font-medium text-sm md:text-base
                transition-all duration-200 touch-target
                ${loading || !username.trim()
                  ? 'bg-midnight-700/50 text-midnight-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-neon-purple to-neon-pink hover:shadow-lg hover:shadow-neon-purple/30 active:scale-[0.98]'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </span>
              ) : (
                'Start Chat'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StartChatModal;

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, error, loading, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim() && password) {
      if (isRegister) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
    }
  };

  const handleInputChange = () => {
    if (error) clearError();
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    clearError();
  };

  return (
    <div className="h-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-64 md:w-80 h-64 md:h-80 bg-neon-purple/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-64 md:w-80 h-64 md:h-80 bg-neon-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 bg-neon-pink/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm md:max-w-md animate-fade-in relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 rounded-xl md:rounded-2xl glass glow-purple">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2 md:mb-3">Private Chat</h1>
          <p className="text-sm md:text-base text-midnight-300">Secure. Simple. Private messaging.</p>
        </div>

        {/* Login/Register Form */}
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl md:rounded-3xl p-5 md:p-8 glow-purple">
          <h2 className="text-lg md:text-xl font-semibold text-midnight-100 mb-4 md:mb-6 text-center">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Username Field */}
          <div className="mb-3 md:mb-4">
            <label htmlFor="username" className="block text-xs md:text-sm font-medium text-midnight-200 mb-1.5 md:mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); handleInputChange(); }}
              placeholder="Enter username..."
              autoComplete="username"
              autoFocus
              maxLength={20}
              className={`
                w-full px-4 py-3 md:px-5 md:py-4 rounded-xl 
                bg-midnight-950/50 border-2 
                ${error ? 'border-red-500/50' : 'border-midnight-700/50'}
                focus:border-neon-purple focus:outline-none
                text-base md:text-lg text-midnight-100 placeholder-midnight-500
                transition-all duration-300
              `}
            />
          </div>

          {/* Password Field */}
          <div className="mb-4 md:mb-6">
            <label htmlFor="password" className="block text-xs md:text-sm font-medium text-midnight-200 mb-1.5 md:mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
                placeholder="Enter password..."
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className={`
                  w-full px-4 py-3 pr-12 md:px-5 md:py-4 rounded-xl 
                  bg-midnight-950/50 border-2 
                  ${error ? 'border-red-500/50' : 'border-midnight-700/50'}
                  focus:border-neon-purple focus:outline-none
                  text-base md:text-lg text-midnight-100 placeholder-midnight-500
                  transition-all duration-300
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-midnight-400 hover:text-midnight-200 transition-colors touch-target"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="mb-3 md:mb-4 text-xs md:text-sm text-red-400 flex items-center gap-2 animate-slide-up">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className={`
              w-full py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg
              transition-all duration-300 touch-target
              ${loading || !username.trim() || !password
                ? 'bg-midnight-700/50 text-midnight-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-purple to-neon-pink hover:shadow-lg hover:shadow-neon-purple/30 text-white active:scale-[0.98]'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isRegister ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>

          {/* Toggle Login/Register */}
          <p className="mt-4 md:mt-6 text-center text-xs md:text-sm text-midnight-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-neon-purple hover:text-neon-pink transition-colors font-medium"
            >
              {isRegister ? 'Sign In' : 'Create one'}
            </button>
          </p>
        </form>

        {/* Features */}
        <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-4 text-center">
          {[
            { icon: '🔒', label: 'Secure' },
            { icon: '⚡', label: 'Real-time' },
            { icon: '🕐', label: 'Auto-clear' }
          ].map((feature, i) => (
            <div 
              key={feature.label}
              className="glass rounded-xl p-2.5 md:p-4 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-xl md:text-2xl mb-1 md:mb-2">{feature.icon}</div>
              <div className="text-[10px] md:text-sm text-midnight-300">{feature.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;

import { useAuth } from './context/AuthContext';
import { useSocket } from './hooks/useSocket';
import Login from './components/Login';
import ChatLayout from './components/ChatLayout';

function App() {
  const { user, token, loading, logout, isAuthenticated } = useAuth();
  const socketData = useSocket(isAuthenticated ? token : null);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-midnight-300 animate-pulse-soft">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <ChatLayout 
      user={user} 
      onLogout={logout} 
      {...socketData}
    />
  );
}

export default App;


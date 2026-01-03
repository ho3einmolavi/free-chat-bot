function OnlineUsers({ users, onSelectUser, currentPartner }) {
  const onlineCount = users.filter(u => u.isOnline).length;

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 scroll-touch">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <h3 className="text-xs md:text-sm font-medium text-midnight-400 uppercase tracking-wider">
          Chats
        </h3>
        <span className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded-full bg-neon-green/20 text-neon-green">
          {onlineCount} online
        </span>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-6 md:py-8">
          <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-xl bg-midnight-800/50 flex items-center justify-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-midnight-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-xs md:text-sm text-midnight-500">No conversations yet</p>
          <p className="text-[10px] md:text-xs text-midnight-600 mt-1">Start a new chat!</p>
        </div>
      ) : (
        <ul className="space-y-1.5 md:space-y-2">
          {users.map((user, index) => (
            <li 
              key={user.username}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => onSelectUser(user.username)}
                className={`
                  w-full flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl
                  transition-all duration-200 touch-target
                  ${currentPartner === user.username 
                    ? 'bg-neon-purple/20 border border-neon-purple/30' 
                    : 'hover:bg-white/5 active:bg-white/10 border border-transparent'
                  }
                `}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center font-semibold text-midnight-200 text-sm md:text-base">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-midnight-950 ${user.isOnline ? 'bg-neon-green' : 'bg-midnight-600'}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-midnight-100 text-sm md:text-base truncate">{user.username}</p>
                  <p className={`text-[10px] md:text-xs ${user.isOnline ? 'text-neon-green' : 'text-midnight-500'}`}>
                    {user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
                <svg className="w-4 h-4 md:w-5 md:h-5 text-midnight-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OnlineUsers;

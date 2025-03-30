const SESSION_ID_KEY = 'chat_session_id';

export const getOrCreateSessionId = (): string => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'server_session';
  }

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}; 
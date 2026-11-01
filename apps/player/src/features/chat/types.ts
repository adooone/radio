export interface ChatMessage {
  nickname: string;
  text: string;
  timestamp: string;
}

export interface User {
  nickname: string;
  lastSeen: string;
  color: string | null;
}

export interface UserWithStatus extends User {
  isOnline: boolean;
}

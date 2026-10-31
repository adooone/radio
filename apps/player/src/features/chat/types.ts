export interface ChatMessage {
  nickname: string;
  text: string;
  timestamp: string;
}

export interface User {
  nickname: string;
  lastSeen: string;
}

export interface UserWithStatus extends User {
  isOnline: boolean;
}

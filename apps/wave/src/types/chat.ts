export interface ChatMessage {
  nickname: string;
  text: string;
  timestamp: string;
}

export interface ChatData {
  environment: string;
  chats: ChatMessage[];
  metadata: {
    created_at: string;
    description: string;
    version: string;
  };
}

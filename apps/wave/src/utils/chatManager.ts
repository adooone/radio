import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import type { ChatData, ChatMessage } from '../types/chat';
import { env } from './env';

class ChatManager {
  private jsonFile: string;
  private logFile: string;
  private chatData: ChatData;

  constructor() {
    // Set file paths based on environment
    const dataDir = join(process.cwd(), 'data');

    if (env.environment === 'production') {
      this.jsonFile = join(dataDir, 'prod-chats.json');
      this.logFile = join(dataDir, 'chat-prod.log');
    } else {
      this.jsonFile = join(dataDir, 'dev-chats.json');
      this.logFile = join(dataDir, 'chat-local.log');
    }

    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Initialize chat data
    this.chatData = this.loadJsonData();

    console.log(
      `💬 Chat manager initialized for ${env.environment} environment`,
    );
    console.log(`📁 JSON: ${this.jsonFile}`);
    console.log(`📄 LOG: ${this.logFile}`);
  }

  private loadJsonData(): ChatData {
    try {
      if (existsSync(this.jsonFile)) {
        const data = readFileSync(this.jsonFile, 'utf8');
        const parsed = JSON.parse(data) as ChatData;

        // Prune old messages on load
        this.pruneMessages(parsed.chats);

        return parsed;
      }
    } catch (error) {
      console.error('Failed to load JSON chat data:', error);
    }

    // Return default structure if file doesn't exist or loading fails
    return {
      environment: env.environment,
      chats: [],
      metadata: {
        created_at: new Date().toISOString().split('T')[0],
        description: `Chat data for ${env.environment} environment`,
        version: '1.0',
      },
    };
  }

  private pruneMessages(messages: ChatMessage[]): void {
    // Keep messages from last 1 hour
    const cutoff = Date.now() - 60 * 60 * 1000;
    const originalLength = messages.length;

    // Filter messages in place
    messages.splice(
      0,
      messages.length,
      ...messages.filter((msg) => Date.parse(msg.timestamp) >= cutoff),
    );

    if (originalLength !== messages.length) {
      console.log(`🧹 Pruned ${originalLength - messages.length} old messages`);
    }
  }

  private saveJsonData(): void {
    try {
      // Prune before saving
      this.pruneMessages(this.chatData.chats);

      const jsonString = JSON.stringify(this.chatData, null, 2);
      writeFileSync(this.jsonFile, jsonString, 'utf8');
    } catch (error) {
      console.error('Failed to save JSON chat data:', error);
    }
  }

  private appendToLog(message: ChatMessage): void {
    try {
      const logEntry = `[${message.timestamp}] ${message.nickname}: ${message.text}\n`;
      appendFileSync(this.logFile, logEntry, 'utf8');
    } catch (error) {
      console.error('Failed to append to log file:', error);
    }
  }

  addMessage(message: ChatMessage): void {
    // Add to in-memory data
    this.chatData.chats.push(message);

    // Save to JSON file
    this.saveJsonData();

    // Also append to log file for backup/debugging
    this.appendToLog(message);

    console.log(
      `💾 Saved message from ${message.nickname} to ${env.environment} files`,
    );
  }

  getHistory(): ChatMessage[] {
    // Prune and return current messages
    this.pruneMessages(this.chatData.chats);
    return [...this.chatData.chats];
  }

  // Get stats about current chat data
  getStats() {
    return {
      environment: this.chatData.environment,
      messageCount: this.chatData.chats.length,
      jsonFile: this.jsonFile,
      logFile: this.logFile,
      lastMessage: this.chatData.chats[this.chatData.chats.length - 1],
    };
  }
}

// Export singleton instance
export const chatManager = new ChatManager();

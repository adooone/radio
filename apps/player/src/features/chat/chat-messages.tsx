import { useT } from '@/i18n';
import { useEffect, useRef } from 'react';
import { Message } from './chat-message';
import type { ChatMessage, UserWithStatus } from './types';

type ChatMessagesProps = {
  messages: ChatMessage[];
  nickname: string;
  users: UserWithStatus[];
};

export const ChatMessages = ({
  messages,
  nickname,
  users,
}: ChatMessagesProps) => {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!nickname) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <p className="text-center text-sm text-cream/40">
          {t('chat.empty.noName')}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="chat-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden py-2"
    >
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-center text-sm text-cream/40">
            {t('chat.empty.noMessages')}
          </p>
        </div>
      ) : (
        messages.map((message) => {
          const sender = users.find(
            (user) => user.nickname === message.nickname,
          );
          return (
            <Message
              key={`${message.nickname}-${message.timestamp}`}
              message={message}
              isSelf={message.nickname === nickname}
              isOnline={sender?.isOnline ?? false}
              color={sender?.color ?? null}
            />
          );
        })
      )}
    </div>
  );
};

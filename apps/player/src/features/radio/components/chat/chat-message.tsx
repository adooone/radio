import clsx from 'clsx';
import type { ChatMessage } from '@/features/radio/hooks/use-chat';
import { useUser } from '@/features/radio/hooks/use-user';
import { useUserColor } from '@/features/radio/hooks/use-user-color';
import { StatusIcon } from '../icons/status-icon';
import { formatTime } from '../../utils/time';

type MessageProps = {
  message: ChatMessage;
  nickname: string;
};

export const Message = (props: MessageProps) => {
  const { message, nickname } = props;
  const isSelf = message.nickname === nickname;
  const displayNickname = message.nickname || 'Анонім';

  // Use the new useUser hook to get user data
  const user = useUser(message.nickname);
  const userIsOnline = user?.isOnline ?? false;
  const messageTime = formatTime(message.timestamp);

  // Get user's color preference and generate effective color
  const { getEffectiveColor } = useUserColor();
  const nicknameColor = getEffectiveColor(message.nickname || 'Анонім', isSelf);

  const messageStyles = isSelf ? styles.selfMessage : styles.otherMessage;
  const messageContent = isSelf ? (
    <div className={clsx(styles.messageContent)}>
      <div className={clsx(styles.messageWithTime)}>
        <span className={clsx(styles.text)}>{message.text}</span>
        <span className={clsx(styles.timestamp)}>{messageTime}</span>
      </div>
    </div>
  ) : (
    <div className={clsx(styles.messageContent)}>
      <div className={clsx(styles.header)}>
        <span className={clsx(styles.nickname, nicknameColor)}>
          {displayNickname}
        </span>
        <StatusIcon
          className={clsx(
            styles.statusIcon,
            userIsOnline ? 'text-green-500' : 'text-gray-500 opacity-60',
          )}
          aria-label={userIsOnline ? 'Онлайн' : 'Офлайн'}
        />
      </div>
      <div className={clsx(styles.messageWithTime)}>
        <span className={clsx(styles.text)}>{message.text}</span>
        <span className={clsx(styles.timestamp)}>{messageTime}</span>
      </div>
    </div>
  );

  return (
    <div className={clsx(styles.messageWrapper)}>
      <div
        className={clsx(styles.message, messageStyles)}
        key={`${message.nickname}-${message.text}-${message.timestamp ?? ''}`}
      >
        {messageContent}
      </div>
    </div>
  );
};

const styles = {
  messageWrapper: ['flex w-full'],
  message: [
    'flex flex-col text-sm p-3 break-words',
    'whitespace-pre-wrap overflow-wrap-anywhere bg-coal-relic/40 rounded-lg',
    'backdrop-blur-xl w-fit max-w-[90%] md:max-w-[80%]',
  ],
  otherMessage: ['bg-coal-relic/40 text-moss-fog text-left'],
  selfMessage: ['bg-river/30 text-moss-fog ml-auto text-right'],
  messageContent: ['flex flex-col gap-1'],
  header: ['flex items-center gap-2'],
  nickname: ['font-display font-semibold uppercase'],
  statusIcon: ['w-4 h-4 flex-shrink-0 mt-[-1px]'],
  messageWithTime: ['flex items-end justify-between gap-2'],
  text: ['flex-1'],
  timestamp: ['text-xs text-white/40 font-mono flex-shrink-0 self-end'],
};

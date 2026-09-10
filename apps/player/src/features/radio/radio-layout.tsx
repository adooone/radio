import { useStream } from './hooks/use-stream';
import clsx from 'clsx';
import { Chat } from './components/chat';
import { useState } from 'react';
import { useUserColorsSync } from './hooks/use-user-colors-sync';
import { Header, VideoPlayer, Fallback } from './components/ui';
import { UserList, AccountSettings } from './components/settings';

export const RadioLayout = () => {
  const { videoRef, streamAvailable } = useStream();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [nickname, setNickname] = useState<string>(
    () => localStorage.getItem('nickname') || '',
  );

  useUserColorsSync();

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePauseClick = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMuteClick = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleNicknameChange = (newNickname: string) => {
    setNickname(newNickname);
  };

  return (
    <div className={clsx(styles.container)}>
      <Header
        isPlaying={isPlaying}
        isMuted={isMuted}
        nickname={nickname}
        onMuteClick={handleMuteClick}
        onUserListClick={() => setIsUserListOpen(true)}
        onSettingsClick={() => setIsAccountSettingsOpen(true)}
      />

      <div className={clsx(styles.layout)}>
        <div className={clsx(styles.video)}>
          {streamAvailable ? (
            <VideoPlayer
              videoRef={videoRef}
              isPlaying={isPlaying}
              isMuted={isMuted}
              isHovering={isHovering}
              onPlayClick={handlePlayClick}
              onPauseClick={handlePauseClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            />
          ) : (
            <Fallback />
          )}
        </div>
        <div className={clsx(styles.sidebar)}>
          <Chat nickname={nickname} setNickname={handleNicknameChange} />
        </div>
      </div>

      <UserList
        isOpen={isUserListOpen}
        nickname={nickname}
        onClose={() => setIsUserListOpen(false)}
      />

      <AccountSettings
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        nickname={nickname}
        onNicknameChange={handleNicknameChange}
      />
    </div>
  );
};

const styles = {
  container: [
    'w-full h-full bg-neutral-900/50 flex flex-col items-center md:justify-center text-neutral-100 p-4',
  ],
  layout: [
    'flex flex-col md:flex-row md:gap-4 w-full h-full md:h-auto max-w-[1200px] md:justify-center',
  ],
  video: ['w-full h-full md:h-[55vh] flex flex-col items-center'],
  sidebar: ['flex flex-col md:min-w-[350px] md:w-[350px] h-[40vh] md:h-[55vh]'],
  spotify: ['w-full p-[100px]'],
} as const;

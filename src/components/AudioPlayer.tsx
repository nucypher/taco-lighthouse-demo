import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { PlaybackControls } from "./audio/PlaybackControls";
import { VolumeControl } from "./audio/VolumeControl";
import { ProgressBar } from "./audio/ProgressBar";

interface AudioPlayerProps {
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
}

export function AudioPlayer({
  title,
  artist,
  coverUrl,
  audioUrl,
  isPlaying,
  onPlayPause,
  onClose,
}: AudioPlayerProps) {
  const {
    currentTime,
    duration,
    volume,
    isMuted,
    handleSeek,
    handleVolumeChange,
    toggleMute,
  } = useAudioPlayback({
    audioUrl,
    isPlaying,
    onPlayPause,
  });

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 backdrop-blur-lg bg-opacity-80">
      <div className="container mx-auto flex items-center gap-4">
        <div className="flex items-center gap-4 min-w-[240px]">
          <img src={coverUrl} alt={title} className="w-12 h-12 rounded-sm object-cover" />
          <div className="flex flex-col">
            <span className="font-medium text-sm truncate">{title}</span>
            <span className="text-sm text-muted-foreground truncate">{artist}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onSkipForward={() => handleSeek([Math.min(duration, currentTime + 10)])}
            onSkipBack={() => handleSeek([Math.max(0, currentTime - 10)])}
          />
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
        </div>

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  );
}
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/audio-utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  return (
    <div className="w-full flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-12 text-right">
        {formatTime(currentTime)}
      </span>
      <Slider
        value={[currentTime]}
        max={duration}
        step={1}
        onValueChange={onSeek}
        className="w-full"
      />
      <span className="text-xs text-muted-foreground w-12">
        {formatTime(duration)}
      </span>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
}

export function PlaybackControls({
  isPlaying,
  onPlayPause,
  onSkipForward,
  onSkipBack,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={onSkipBack}
      >
        <SkipBack className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full",
          isPlaying ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-secondary"
        )}
        onClick={onPlayPause}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={onSkipForward}
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}
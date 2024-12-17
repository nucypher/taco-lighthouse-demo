import { Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAudioPlayer } from "@/App";

interface TrackCardProps {
  title: string;
  artist: string;
  coverUrl: string;
  trackId: string;
  ipfsCid: string | null;
}

export const TrackCard = ({ title, artist, coverUrl, ipfsCid }: TrackCardProps) => {
  const { toast } = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudioPlayer();

  const getTrackUrl = (cid: string | null) => {
    if (!cid) return null;
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  const handlePlay = () => {
    const trackUrl = getTrackUrl(ipfsCid);
    if (!trackUrl) {
      toast({
        title: 'Error',
        description: 'Track not available',
        variant: 'destructive',
      });
      return;
    }

    if (currentTrack?.audioUrl === trackUrl) {
      togglePlayPause();
    } else {
      playTrack({
        title,
        artist,
        coverUrl,
        audioUrl: trackUrl,
      });
      toast({
        title: 'Playing Track',
        description: `Now playing ${title} by ${artist}`,
      });
    }
  };

  const isThisTrackPlaying = currentTrack?.audioUrl === getTrackUrl(ipfsCid) && isPlaying;

  return (
    <div className="group relative overflow-hidden rounded-sm border border-border hover-scale">
      <img
        src={coverUrl}
        alt={`${title} by ${artist}`}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute inset-0 glass-overlay opacity-0 group-hover:opacity-100 flex items-center justify-center">
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full bg-background/80 hover:bg-background/90 transition-colors"
          onClick={handlePlay}
        >
          {isThisTrackPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 glass-overlay">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </div>
    </div>
  );
};
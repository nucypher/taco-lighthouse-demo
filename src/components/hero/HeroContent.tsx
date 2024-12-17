import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAudioPlayer } from "@/App";
import { getArtworkUrl, getTrackUrl } from "@/utils/artwork-utils";

interface Track {
  id: string;
  title: string;
  owner_id: string | null;
  cover_art_cid: string | null;
  ipfs_cid: string | null;
}

interface HeroContentProps {
  track: Track;
}

export function HeroContent({ track }: HeroContentProps) {
  const { toast } = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudioPlayer();

  const handlePlay = () => {
    const trackUrl = getTrackUrl(track.ipfs_cid);
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
        title: track.title,
        artist: track.owner_id ? `${track.owner_id.slice(0, 8)}...` : 'Unknown Artist',
        coverUrl: getArtworkUrl(track.cover_art_cid),
        audioUrl: trackUrl,
      });
      toast({
        title: 'Playing Track',
        description: `Now playing ${track.title}`,
      });
    }
  };

  const isThisTrackPlaying = currentTrack?.audioUrl === getTrackUrl(track.ipfs_cid) && isPlaying;

  return (
    <div className="relative h-[500px] rounded-sm overflow-hidden mb-8 border border-border">
      <img
        src={getArtworkUrl(track.cover_art_cid)}
        alt={track.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 glass-overlay">
        <div className="container h-full flex flex-col justify-end p-8">
          <h2 className="text-4xl font-bold tracking-tight mb-2">{track.title}</h2>
          <p className="text-xl text-muted-foreground mb-4 font-medium">
            {track.owner_id ? `By ${track.owner_id.slice(0, 8)}...` : 'Unknown Artist'}
          </p>
          <Button 
            className="w-fit rounded-sm gap-2" 
            onClick={handlePlay}
          >
            {isThisTrackPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isThisTrackPlaying ? 'Pause' : 'Start Listening'}
          </Button>
        </div>
      </div>
    </div>
  );
}
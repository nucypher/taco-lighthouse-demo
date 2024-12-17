import { Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";

interface TrackCardProps {
  title: string;
  artist: string;
  coverUrl: string;
  trackId: string;
  ipfsCid: string | null;
}

export const TrackCard = ({ title, artist, coverUrl, trackId, ipfsCid }: TrackCardProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getTrackUrl = (cid: string | null) => {
    if (!cid) return null;
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  const handlePlay = async () => {
    const trackUrl = getTrackUrl(ipfsCid);
    if (!trackUrl) {
      toast({
        title: 'Error',
        description: 'Track not available',
        variant: 'destructive',
      });
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(trackUrl);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        toast({
          title: 'Playing Track',
          description: `Now playing ${title} by ${artist}`,
        });
      } catch (error) {
        console.error('Error playing track:', error);
        toast({
          title: 'Error',
          description: 'Failed to play track',
          variant: 'destructive',
        });
      }
    }
  };

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
          variant="secondary" 
          className="rounded-sm"
          onClick={handlePlay}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 glass-overlay">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </div>
    </div>
  );
};
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAudioPlayer } from "@/App";

interface Track {
  id: string;
  title: string;
  owner_id: string | null;
  cover_art_cid: string | null;
  ipfs_cid: string | null;
}

export const HeroSection = () => {
  const [randomTrack, setRandomTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudioPlayer();

  useEffect(() => {
    const fetchRandomTrack = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .limit(1)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching random track:', error);
          return;
        }

        if (data && data.length > 0) {
          setRandomTrack(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomTrack();
  }, []);

  const getArtworkUrl = (cid: string | null) => {
    if (!cid) return "/placeholder.svg";
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  const getTrackUrl = (cid: string | null) => {
    if (!cid) return null;
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  const handlePlay = () => {
    if (!randomTrack) return;

    const trackUrl = getTrackUrl(randomTrack.ipfs_cid);
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
        title: randomTrack.title,
        artist: randomTrack.owner_id ? `${randomTrack.owner_id.slice(0, 8)}...` : 'Unknown Artist',
        coverUrl: getArtworkUrl(randomTrack.cover_art_cid),
        audioUrl: trackUrl,
      });
      toast({
        title: 'Playing Track',
        description: `Now playing ${randomTrack.title}`,
      });
    }
  };

  const isThisTrackPlaying = currentTrack?.audioUrl === getTrackUrl(randomTrack?.ipfs_cid) && isPlaying;

  if (isLoading) {
    return (
      <div className="relative h-[500px] rounded-sm overflow-hidden mb-8 border border-border">
        <div className="absolute inset-0 glass-overlay flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!randomTrack) {
    return (
      <div className="relative h-[500px] rounded-sm overflow-hidden mb-8 border border-border">
        <div className="absolute inset-0 glass-overlay flex items-center justify-center">
          <p>No tracks available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] rounded-sm overflow-hidden mb-8 border border-border">
      <img
        src={getArtworkUrl(randomTrack.cover_art_cid)}
        alt={randomTrack.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 glass-overlay">
        <div className="container h-full flex flex-col justify-end p-8">
          <h2 className="text-4xl font-bold tracking-tight mb-2">{randomTrack.title}</h2>
          <p className="text-xl text-muted-foreground mb-4 font-medium">
            {randomTrack.owner_id ? `By ${randomTrack.owner_id.slice(0, 8)}...` : 'Unknown Artist'}
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
};
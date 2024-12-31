import { Play, Pause, Lock } from "lucide-react";
import { useAudioPlayer } from "@/App";
import { Button } from "./ui/button";
import { useTrackPlayback } from "@/hooks/use-track-playback";
import { useQuery } from "@tanstack/react-query";
import { userClient } from "@/integrations/orbis/user";

interface TrackCardProps {
  title: string;
  artist: string;
  coverUrl: string;
  trackId: string;
  ipfsCid: string | null;
  owner_id: string | null;
  cover_art_cid: string | null;
}

export const TrackCard = ({ 
  title, 
  artist, 
  coverUrl, 
  ipfsCid,
  owner_id,
  cover_art_cid,
}: TrackCardProps) => {
  const { currentTrack, isPlaying, togglePlayPause } = useAudioPlayer();
  const { handlePlay, isDecrypting } = useTrackPlayback();

  // Fetch artist details from Orbis
  const { data: artistData } = useQuery({
    queryKey: ['artist', owner_id],
    queryFn: async () => {
      if (!owner_id) return null;
      console.log('🎵 Fetching artist data for:', owner_id);
      const user = await userClient.getOrbisUser(owner_id);
      console.log('🎵 Artist data:', user);
      return user;
    },
    enabled: !!owner_id,
  });

  const handleClick = async () => {
    if (currentTrack?.title === title && currentTrack?.artist === artist) {
      togglePlayPause();
      return;
    }

    await handlePlay({
      title,
      owner_id,
      ipfs_cid: ipfsCid,
      cover_art_cid,
    });
  };

  const isThisTrackPlaying = currentTrack?.title === title && currentTrack?.artist === artist && isPlaying;
  const displayName = artistData?.name || artist;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border hover-scale">
      <img
        src={coverUrl}
        alt={`${title} by ${displayName}`}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute inset-0 glass-overlay opacity-0 group-hover:opacity-100 touch-device:opacity-100 flex items-center justify-center">
        <Button 
          onClick={handleClick}
          size="icon"
          className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-primary hover:bg-primary/90"
        >
          {isDecrypting ? (
            <Lock className="h-4 w-4 sm:h-6 sm:w-6" />
          ) : isThisTrackPlaying ? (
            <Pause className="h-4 w-4 sm:h-6 sm:w-6" />
          ) : (
            <Play className="h-4 w-4 sm:h-6 sm:w-6" />
          )}
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 glass-overlay">
        <h3 className="font-medium text-xs sm:text-sm truncate">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{displayName}</p>
      </div>
    </div>
  );
}
import { Play } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface TrackCardProps {
  title: string;
  artist: string;
  coverUrl: string;
  trackId: string;
}

export const TrackCard = ({ title, artist, coverUrl, trackId }: TrackCardProps) => {
  const { toast } = useToast();

  const handlePlay = async () => {
    // Temporary implementation without storage
    console.log('Playing track:', trackId);
    toast({
      title: 'Playing Track',
      description: `Now playing ${title} by ${artist}`,
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-lg hover-scale">
      <img
        src={coverUrl}
        alt={`${title} by ${artist}`}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute inset-0 glass-overlay opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-full"
          onClick={handlePlay}
        >
          <Play className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 glass-overlay">
        <h3 className="font-semibold text-sm truncate">{title}</h3>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </div>
    </div>
  );
};
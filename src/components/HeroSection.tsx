import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Track {
  id: string;
  title: string;
  owner_id: string | null;
  cover_art_cid: string | null;
}

export const HeroSection = () => {
  const [randomTrack, setRandomTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        src={randomTrack.cover_art_cid || "/placeholder.svg"}
        alt={randomTrack.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 glass-overlay">
        <div className="container h-full flex flex-col justify-end p-8">
          <h2 className="text-4xl font-bold tracking-tight mb-2">{randomTrack.title}</h2>
          <p className="text-xl text-muted-foreground mb-4 font-medium">
            {randomTrack.owner_id ? `By ${randomTrack.owner_id.slice(0, 8)}...` : 'Unknown Artist'}
          </p>
          <Button className="w-fit rounded-sm">Start Listening</Button>
        </div>
      </div>
    </div>
  );
};
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeroLoading } from "./hero/HeroLoading";
import { HeroEmpty } from "./hero/HeroEmpty";
import { HeroContent } from "./hero/HeroContent";

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
    return <HeroLoading />;
  }

  if (!randomTrack) {
    return <HeroEmpty />;
  }

  return <HeroContent track={randomTrack} />;
};
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useTrackPlayback } from "@/hooks/use-track-playback";
import { useAuth } from "@/contexts/AuthContext";

interface Track {
  id: string;
  title: string;
  owner_id: string | null;
  cover_art_cid: string | null;
  ipfs_cid: string | null;
}

const Index = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<any>(null);
  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);
  const { handlePlay, isDecrypting, getArtworkUrl } = useTrackPlayback();
  const { session, isLoading: authLoading } = useAuth();

  console.log("Auth state:", { session, authLoading });

  const fetchTracks = async (query: string = "") => {
    try {
      console.log("Fetching tracks with query:", query);
      setIsLoading(true);
      setError(null);
      
      let queryBuilder = supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      }

      const { data, error: supabaseError } = await queryBuilder;

      if (supabaseError) {
        console.error("Error fetching tracks:", supabaseError);
        setError(supabaseError);
        return;
      }

      console.log("Fetched tracks:", data);

      if (data) {
        if (!query && data.length > 0) {
          setFeaturedTrack(data[0]);
          setTracks(data.slice(1));
        } else {
          setTracks(data);
        }
      }
    } catch (err) {
      console.error("Error in fetchTracks:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      console.log("Auth loading complete, fetching tracks");
      fetchTracks();
    }
  }, [authLoading]);

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    setSearchQuery(query);
    fetchTracks(query);
  };

  const handlePlayFeatured = () => {
    if (featuredTrack) {
      handlePlay(featuredTrack);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} onUploadSuccess={() => fetchTracks(searchQuery)} />
      <main className="container mx-auto px-2 sm:px-4 pt-20 md:pt-24 pb-16">
        {error && <ErrorDisplay error={error} />}
        
        {featuredTrack && !searchQuery && (
          <section className="mb-6 md:mb-12">
            <div className="relative h-[200px] md:h-[400px] rounded-xl overflow-hidden">
              <img
                src={getArtworkUrl(featuredTrack.cover_art_cid)}
                alt={featuredTrack.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent">
                <div className="absolute bottom-0 left-0 p-4 md:p-8">
                  <h1 className="text-xl md:text-4xl font-bold mb-2">{featuredTrack.title}</h1>
                  <p className="text-sm md:text-lg text-muted-foreground mb-4">
                    {featuredTrack.owner_id ? `${featuredTrack.owner_id.slice(0, 8)}...` : 'Unknown Artist'}
                  </p>
                  <Button 
                    className="rounded-full w-full sm:w-auto" 
                    onClick={handlePlayFeatured}
                    disabled={isDecrypting}
                  >
                    {isDecrypting ? 'Decrypting...' : 'Start Listening'}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Discover"}
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {isLoading ? (
              Array(5).fill(null).map((_, index) => (
                <div key={index} className="h-32 sm:h-64 rounded-xl bg-muted animate-pulse" />
              ))
            ) : tracks.length > 0 ? (
              tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  trackId={track.id}
                  title={track.title}
                  artist={track.owner_id ? `${track.owner_id.slice(0, 8)}...` : 'Unknown Artist'}
                  coverUrl={getArtworkUrl(track.cover_art_cid)}
                  ipfsCid={track.ipfs_cid}
                  owner_id={track.owner_id}
                  cover_art_cid={track.cover_art_cid}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                {searchQuery ? "No tracks found matching your search" : "No tracks available"}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
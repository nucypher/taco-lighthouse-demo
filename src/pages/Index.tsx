import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useAudioPlayer } from "@/App";

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
  const { playTrack } = useAudioPlayer();

  const fetchTracks = async (query: string = "") => {
    try {
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
        setError(supabaseError);
        return;
      }

      if (data) {
        if (!query && data.length > 0) {
          setFeaturedTrack(data[0]);
          setTracks(data.slice(1));
        } else {
          setTracks(data);
        }
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchTracks(query);
  };

  const getArtworkUrl = (cid: string | null) => {
    if (!cid) return "/placeholder.svg";
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  const handlePlayFeatured = () => {
    if (featuredTrack) {
      playTrack({
        title: featuredTrack.title,
        artist: featuredTrack.owner_id ? `${featuredTrack.owner_id.slice(0, 8)}...` : 'Unknown Artist',
        coverUrl: getArtworkUrl(featuredTrack.cover_art_cid),
        audioUrl: `https://gateway.lighthouse.storage/ipfs/${featuredTrack.ipfs_cid}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} onUploadSuccess={() => fetchTracks(searchQuery)} />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {error && <ErrorDisplay error={error} />}
        
        {featuredTrack && !searchQuery && (
          <section className="mb-12">
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img
                src={getArtworkUrl(featuredTrack.cover_art_cid)}
                alt={featuredTrack.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent">
                <div className="absolute bottom-0 left-0 p-8">
                  <h1 className="text-4xl font-bold mb-2">{featuredTrack.title}</h1>
                  <p className="text-lg text-muted-foreground mb-4">
                    {featuredTrack.owner_id ? `${featuredTrack.owner_id.slice(0, 8)}...` : 'Unknown Artist'}
                  </p>
                  <Button onClick={handlePlayFeatured} className="rounded-full">Start Listening</Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Discover"}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {isLoading ? (
              Array(5).fill(null).map((_, index) => (
                <div key={index} className="h-64 rounded-xl bg-muted animate-pulse" />
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
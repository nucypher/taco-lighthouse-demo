import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

  const fetchTracks = async (query: string = "") => {
    try {
      setIsLoading(true);
      let queryBuilder = supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      } else {
        queryBuilder = queryBuilder.limit(10);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Error fetching tracks:', error);
        return;
      }

      if (data) {
        setTracks(data);
      }
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} onUploadSuccess={() => fetchTracks(searchQuery)} />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Tracks"}
            </h2>
            <Button variant="ghost">View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {isLoading ? (
              Array(5).fill(null).map((_, index) => (
                <div key={index} className="h-64 rounded-sm bg-muted animate-pulse" />
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
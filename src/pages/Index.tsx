import { useEffect, useState } from "react";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useTrackPlayback } from "@/hooks/use-track-playback";
import { useAuth } from "@/contexts/AuthContext";
import { useTracks } from "@/hooks/use-ceramic-tracks";

interface Track {
  id: string;
  title: string;
  owner: string;
  artwork?: string;
  ipfsCid: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);
  const { handlePlay, isDecrypting, getArtworkUrl } = useTrackPlayback();
  const { session, isLoading: authLoading } = useAuth();
  const { data: tracks, isLoading, error } = useTracks();

  console.log("Auth state:", { session, authLoading });

  useEffect(() => {
    if (tracks && tracks.length > 0 && !searchQuery) {
      setFeaturedTrack(tracks[0]);
    }
  }, [tracks, searchQuery]);

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    setSearchQuery(query);
  };

  const handlePlayFeatured = () => {
    if (featuredTrack) {
      handlePlay({
        title: featuredTrack.title,
        owner_id: featuredTrack.owner,
        ipfs_cid: featuredTrack.ipfsCid,
        cover_art_cid: featuredTrack.artwork
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const filteredTracks = tracks?.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
        {error && <ErrorDisplay error={error} />}
        
        {featuredTrack && !searchQuery && (
          <section className="mb-6 md:mb-12">
            <div className="relative h-[200px] md:h-[400px] rounded-xl overflow-hidden">
              <img
                src={getArtworkUrl(featuredTrack.artwork)}
                alt={featuredTrack.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent">
                <div className="absolute bottom-0 left-0 p-4 md:p-8">
                  <h1 className="text-xl md:text-4xl font-bold mb-2">{featuredTrack.title}</h1>
                  <p className="text-sm md:text-lg text-muted-foreground mb-4">
                    {featuredTrack.owner ? `${featuredTrack.owner.slice(0, 8)}...` : 'Unknown Artist'}
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
            ) : filteredTracks.length > 0 ? (
              filteredTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  trackId={track.id}
                  title={track.title}
                  artist={track.owner ? `${track.owner.slice(0, 8)}...` : 'Unknown Artist'}
                  coverUrl={getArtworkUrl(track.artwork)}
                  ipfsCid={track.ipfsCid}
                  owner_id={track.owner}
                  cover_art_cid={track.artwork}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                {searchQuery ? "No tracks found matching your search" : "No tracks available"}
              </p>
            )}
          </div>
        </section>
    </>
  );
};

export default Index;
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";

const FEATURED_TRACKS = [
  {
    title: "I'm the One",
    artist: "DJ Khaled ft. Justin Bieber",
    coverUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    trackId: "track-1", // Added trackId
  },
  {
    title: "The Wind",
    artist: "Cat Stevens",
    coverUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    trackId: "track-2", // Added trackId
  },
  {
    title: "Happiness",
    artist: "Pharrell Williams",
    coverUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    trackId: "track-3", // Added trackId
  },
  {
    title: "Havana",
    artist: "Camila Cabello",
    coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    trackId: "track-4", // Added trackId
  },
  {
    title: "Bad Guy",
    artist: "Billie Eilish",
    coverUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    trackId: "track-5", // Added trackId
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <HeroSection />
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Discover</h2>
            <Button variant="ghost">View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {FEATURED_TRACKS.map((track) => (
              <TrackCard key={track.trackId} {...track} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
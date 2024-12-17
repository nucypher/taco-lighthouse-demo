import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import { AudioPlayer } from "./components/AudioPlayer";

const queryClient = new QueryClient();

interface CurrentTrack {
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
}

export const useAudioPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = (track: CurrentTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  return {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    stopPlayback,
  };
};

const App = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    stopPlayback,
  } = useAudioPlayer();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="pb-24"> {/* Add padding to prevent content from being hidden behind the player */}
            <Routes>
              <Route path="/" element={<Index />} />
            </Routes>
          </div>
          {currentTrack && (
            <AudioPlayer
              title={currentTrack.title}
              artist={currentTrack.artist}
              coverUrl={currentTrack.coverUrl}
              audioUrl={currentTrack.audioUrl}
              isPlaying={isPlaying}
              onPlayPause={togglePlayPause}
              onClose={stopPlayback}
            />
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
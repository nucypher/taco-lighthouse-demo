import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import Index from "./pages/Index";
import { AudioPlayer } from "./components/AudioPlayer";

const queryClient = new QueryClient();

interface CurrentTrack {
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
}

interface AudioPlayerContextType {
  currentTrack: CurrentTrack | null;
  isPlaying: boolean;
  playTrack: (track: CurrentTrack) => void;
  togglePlayPause: () => void;
  stopPlayback: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};

const App = () => {
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

  const audioPlayerValue = {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    stopPlayback,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AudioPlayerContext.Provider value={audioPlayerValue}>
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
      </AudioPlayerContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
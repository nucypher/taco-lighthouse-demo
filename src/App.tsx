import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import { AudioPlayer } from "./components/AudioPlayer";
import { AuthProvider } from "./contexts/AuthContext";
import { WalletProvider } from "./contexts/WalletContext";
import { connectWalletOnly } from "@/services/wallet";

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
  console.log('Rendering App component');
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Add wallet reconnection logic at the app root
  useEffect(() => {
    const reconnectWallet = async () => {
      console.log('[APP] Attempting to reconnect wallet on app mount...');
      const storedWallet = localStorage.getItem('connectedWallet');
      
      if (storedWallet) {
        console.log('[APP] Found stored wallet, attempting to reconnect:', storedWallet);
        try {
          const reconnectedWallet = await connectWalletOnly();
          if (reconnectedWallet) {
            console.log('[APP] Successfully reconnected wallet:', reconnectedWallet);
          } else {
            console.log('[APP] Failed to reconnect wallet');
            localStorage.removeItem('connectedWallet');
          }
        } catch (error) {
          console.error('[APP] Error reconnecting wallet:', error);
          localStorage.removeItem('connectedWallet');
        }
      } else {
        console.log('[APP] No stored wallet found');
      }
    };

    reconnectWallet();
  }, []);

  const audioPlayerValue = {
    currentTrack,
    isPlaying,
    playTrack: (track: CurrentTrack) => {
      setCurrentTrack(track);
      setIsPlaying(true);
    },
    togglePlayPause: () => setIsPlaying(!isPlaying),
    stopPlayback: () => {
      setCurrentTrack(null);
      setIsPlaying(false);
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <AudioPlayerContext.Provider value={audioPlayerValue}>
                <Toaster />
                <Sonner />
                <div className="pb-24">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </div>
                {currentTrack && (
                  <AudioPlayer
                    title={currentTrack.title}
                    artist={currentTrack.artist}
                    coverUrl={currentTrack.coverUrl}
                    audioUrl={currentTrack.audioUrl}
                    isPlaying={isPlaying}
                    onPlayPause={audioPlayerValue.togglePlayPause}
                    onClose={audioPlayerValue.stopPlayback}
                  />
                )}
              </AudioPlayerContext.Provider>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </WalletProvider>
    </QueryClientProvider>
  );
};

export default App;
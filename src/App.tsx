import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import { AudioPlayer } from "./components/AudioPlayer";
import { AuthProvider } from "./contexts/AuthContext";
import { WalletProvider } from "./contexts/WalletContext";
import { PrivyProvider } from "@privy-io/react-auth";
import { toast } from "./components/ui/use-toast";
import { mainnet } from "@privy-io/react-auth";

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

// Hardcode the Privy App ID for development
const PRIVY_APP_ID = "cm50x0smr03cgw0xcmg48uk7e";

const App = () => {
  console.log('Rendering App component');
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  console.log('Privy App ID:', PRIVY_APP_ID);

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

  if (!PRIVY_APP_ID) {
    toast({
      title: "Configuration Error",
      description: "Privy App ID is not configured.",
      variant: "destructive",
    });
    return null;
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
          showWalletLoginFirst: true,
        },
        defaultChain: mainnet,
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        },
        autoConnect: false
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WalletProvider>
            <AuthProvider>
              <TooltipProvider>
                <AudioPlayerContext.Provider value={audioPlayerValue}>
                  <Toaster />
                  <Sonner />
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </Layout>
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
          </WalletProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default App;
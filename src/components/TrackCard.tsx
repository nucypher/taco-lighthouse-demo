import { Play, Pause, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAudioPlayer } from "@/App";
import { conditions, decrypt, domains, initialize, ThresholdMessageKit } from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import { ethers } from "ethers";
import { useState } from "react";
import { Button } from "./ui/button";

interface TrackCardProps {
  title: string;
  artist: string;
  coverUrl: string;
  trackId: string;
  ipfsCid: string | null;
}

export const TrackCard = ({ 
  title, 
  artist, 
  coverUrl, 
  ipfsCid
}: TrackCardProps) => {
  const { toast } = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudioPlayer();
  const [isDecrypting, setIsDecrypting] = useState(false);

  const getTrackUrl = (cid: string | null) => {
    if (!cid) return null;
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  const handlePlay = async () => {
    const trackUrl = getTrackUrl(ipfsCid);
    if (!trackUrl) {
      toast({
        title: 'Error',
        description: 'Track not available',
        variant: 'destructive',
      });
      return;
    }

    if (currentTrack?.audioUrl === trackUrl) {
      togglePlayPause();
      return;
    }

    try {
      setIsDecrypting(true);
      
      console.log('🎵 Starting track decryption process...');
      
      await initialize();
      console.log('✅ TACo initialized successfully');
      
      // Use Amoy testnet provider for RPC access
      const amoyProvider = new ethers.providers.JsonRpcProvider(
        'https://rpc-amoy.polygon.technology',
        {
          name: 'amoy',
          chainId: 80002, // Amoy testnet chainId
        }
      );

      // Get web3 provider and signer from the connected wallet for authentication
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('✅ Web3 provider ready:', {
        network: await web3Provider.getNetwork(),
        currentAccount: web3Provider.getSigner()
      });

      const response = await fetch(trackUrl);
      const encryptedData = await response.arrayBuffer();
      console.log('✅ Encrypted data fetched, size:', encryptedData.byteLength, 'bytes');
      
      const messageKit = ThresholdMessageKit.fromBytes(new Uint8Array(encryptedData));
      console.log('✅ MessageKit created from encrypted data');

      const conditionContext = conditions.context.ConditionContext.fromMessageKit(messageKit);
      console.log('✅ Condition context created:', conditionContext);
      
      const authProvider = new EIP4361AuthProvider(
        web3Provider,
        web3Provider.getSigner()
      );
      conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);
      console.log('✅ Auth provider added to condition context');

      console.log('🔓 Starting decryption...');
      const decryptedData = await decrypt(
        amoyProvider, // Use Amoy provider for decryption
        domains.DEVNET,
        messageKit,
        conditionContext
      );
      console.log('✅ Decryption successful, decrypted size:', decryptedData.byteLength, 'bytes');

      const blob = new Blob([decryptedData], { type: 'audio/mpeg' });
      const decryptedUrl = URL.createObjectURL(blob);
      console.log('✅ Blob URL created for decrypted audio');

      playTrack({
        title,
        artist,
        coverUrl,
        audioUrl: decryptedUrl,
      });

      toast({
        title: 'Playing Track',
        description: `Now playing ${title} by ${artist}`,
      });
    } catch (error) {
      console.error('❌ Decryption error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: 'Access Denied',
        description: 'You do not meet the required conditions to play this track',
        variant: 'destructive',
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const isThisTrackPlaying = currentTrack?.audioUrl === getTrackUrl(ipfsCid) && isPlaying;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border hover-scale">
      <img
        src={coverUrl}
        alt={`${title} by ${artist}`}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute inset-0 glass-overlay opacity-0 group-hover:opacity-100 flex items-center justify-center">
        <Button 
          onClick={handlePlay}
          size="icon"
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
        >
          {isDecrypting ? (
            <Lock className="h-6 w-6" />
          ) : isThisTrackPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 glass-overlay">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </div>
    </div>
  );
};
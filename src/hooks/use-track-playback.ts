import { useAudioPlayer } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { conditions, decrypt, domains, initialize, ThresholdMessageKit } from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import { ethers } from "ethers";
import { useState } from "react";

interface Track {
  title: string;
  owner_id: string | null;
  ipfs_cid: string | null;
  cover_art_cid: string | null;
}

export function useTrackPlayback() {
  const { playTrack } = useAudioPlayer();
  const { toast } = useToast();
  const [isDecrypting, setIsDecrypting] = useState(false);

  const getTrackUrl = (cid: string | null) => {
    if (!cid) return null;
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  const getArtworkUrl = (cid: string | null) => {
    if (!cid) return "/placeholder.svg";
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  const handlePlay = async (track: Track) => {
    const trackUrl = getTrackUrl(track.ipfs_cid);
    if (!trackUrl) {
      toast({
        title: 'Error',
        description: 'Track not available',
        variant: 'destructive',
      });
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
      if (!web3Provider) {
        toast({
          title: 'Connect Wallet',
          description: 'Please connect your wallet to play encrypted tracks',
          variant: 'destructive',
        });
        return;
      }

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
        amoyProvider,
        domains.DEVNET,
        messageKit,
        conditionContext
      );
      console.log('✅ Decryption successful, decrypted size:', decryptedData.byteLength, 'bytes');

      const blob = new Blob([decryptedData], { type: 'audio/mpeg' });
      const decryptedUrl = URL.createObjectURL(blob);
      console.log('✅ Blob URL created for decrypted audio');

      playTrack({
        title: track.title,
        artist: track.owner_id ? `${track.owner_id.slice(0, 8)}...` : 'Unknown Artist',
        coverUrl: getArtworkUrl(track.cover_art_cid),
        audioUrl: decryptedUrl,
      });

      toast({
        title: 'Playing Track',
        description: `Now playing ${track.title}`,
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

  return {
    handlePlay,
    isDecrypting,
    getArtworkUrl,
  };
}
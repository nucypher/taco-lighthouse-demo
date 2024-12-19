import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { connectWallet } from "@/lib/web3";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { Link } from "react-router-dom";

export const WalletButton = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const { wallet, setWallet } = useWallet();

  const handleConnect = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      console.log('Attempting to connect wallet...');
      const connectedWallet = await connectWallet();
      
      if (!connectedWallet) {
        console.log('Failed to connect wallet - no wallet returned');
        throw new Error('Failed to connect wallet');
      }

      console.log('Wallet connected successfully:', connectedWallet);
      setWallet(connectedWallet);
      
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Get the connected address from the wallet state
  const connectedAddress = wallet?.accounts?.[0]?.address;
  const truncatedAddress = connectedAddress
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : '';

  if (wallet) {
    return (
      <Link to="/profile">
        <Button variant="secondary" className="rounded-full font-medium">
          {truncatedAddress}
        </Button>
      </Link>
    );
  }

  return (
    <Button 
      variant="default"
      onClick={handleConnect}
      disabled={isConnecting}
      className="rounded-full font-medium whitespace-nowrap text-sm"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};
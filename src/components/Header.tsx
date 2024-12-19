import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { connectWallet } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UploadTrackForm } from "./UploadTrackForm";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { Link } from "react-router-dom";
import { authenticateWithSupabase, signInWithEthereum, setSupabaseSession } from "@/services/auth";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onUploadSuccess?: () => void;
}

export const Header = ({ onSearch, onUploadSuccess }: HeaderProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
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

      // Get the connected address
      const address = connectedWallet.accounts[0].address;
      
      // Sign in with Ethereum
      console.log('Starting SIWE authentication...');
      const { message, signature } = await signInWithEthereum(address);
      
      // Authenticate with Supabase
      console.log('Authenticating with Supabase...');
      const authResponse = await authenticateWithSupabase(address, message, signature);
      
      if (authResponse?.session) {
        await setSupabaseSession(authResponse.session);
        console.log('Authentication successful:', authResponse.session);
        toast({
          title: "Connected",
          description: "Wallet connected and verified successfully",
        });
      } else {
        throw new Error('Authentication failed - no session returned');
      }
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

  const handleUploadClick = async () => {
    console.log('Upload clicked. Current wallet state:', wallet);
    console.log('Current session state:', session);
    
    if (!wallet?.accounts?.[0]?.address) {
      console.log('No wallet connected when trying to upload');
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to upload tracks",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user) {
      console.log('No session when trying to upload');
      try {
        // Attempt to authenticate if wallet is connected but no session exists
        const address = wallet.accounts[0].address;
        const { message, signature } = await signInWithEthereum(address);
        const authResponse = await authenticateWithSupabase(address, message, signature);
        
        if (authResponse?.session) {
          await setSupabaseSession(authResponse.session);
          setShowUploadDialog(true);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Authentication Required",
          description: "Please sign in with your wallet to upload tracks",
          variant: "destructive",
        });
        return;
      }
    } else {
      setShowUploadDialog(true);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Get the connected address from the wallet state
  const connectedAddress = wallet?.accounts?.[0]?.address;
  const truncatedAddress = connectedAddress
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-[2px] border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-8 flex-1">
          <Link to="/" className="text-xl font-bold tracking-tight whitespace-nowrap">TACo</Link>
          <div className="relative flex-1 max-w-[400px] hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              className="pl-10 bg-secondary rounded-full border-0 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="secondary" 
            onClick={handleUploadClick} 
            className="rounded-full font-medium hidden xs:inline-flex"
          >
            Upload
          </Button>
          {wallet ? (
            <Link to="/profile">
              <Button 
                variant="secondary" 
                className="rounded-full font-medium"
              >
                {truncatedAddress}
              </Button>
            </Link>
          ) : (
            <Button 
              variant="default"
              onClick={handleConnect}
              disabled={isConnecting}
              className="rounded-full font-medium whitespace-nowrap text-sm"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </div>

      <div className="sm:hidden border-t border-border">
        <div className="container mx-auto px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              className="pl-10 bg-secondary rounded-full border-0 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Track</DialogTitle>
          </DialogHeader>
          <UploadTrackForm 
            onSuccess={() => {
              setShowUploadDialog(false);
              onUploadSuccess?.();
            }} 
            onClose={() => setShowUploadDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
};
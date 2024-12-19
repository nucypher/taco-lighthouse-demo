import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { connectWallet, disconnectWallet } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UploadTrackForm } from "./UploadTrackForm";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onUploadSuccess?: () => void;
}

interface WalletState {
  label: string;
  accounts: { address: string }[];
}

export const Header = ({ onSearch, onUploadSuccess }: HeaderProps) => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const { session } = useAuth();

  const handleConnect = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      const connectedWallet = await connectWallet();
      if (!connectedWallet) {
        throw new Error('Failed to connect wallet');
      }

      setWallet(connectedWallet);
      toast({
        title: "Connected",
        description: "Wallet connected and verified successfully",
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (wallet) {
        await disconnectWallet(wallet);
        setWallet(null);
        toast({
          title: "Disconnected",
          description: "Wallet disconnected successfully",
        });
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  const handleUploadClick = () => {
    if (!session) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to upload tracks",
        variant: "destructive",
      });
      return;
    }
    setShowUploadDialog(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Get the connected address from the wallet state
  const connectedAddress = wallet?.accounts[0]?.address;
  const truncatedAddress = connectedAddress
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-[2px] border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-8 flex-1">
          <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">TACo</h1>
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
            <Button 
              variant="secondary" 
              onClick={handleDisconnect} 
              className="rounded-full font-medium"
            >
              {truncatedAddress}
            </Button>
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
            wallet={wallet}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
};
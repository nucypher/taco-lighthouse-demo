import { Search, Upload, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { connectWallet, disconnectWallet } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UploadTrackForm } from "./UploadTrackForm";

export const Header = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      const connectedWallet = await connectWallet();
      setWallet(connectedWallet);
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    if (wallet) {
      await disconnectWallet(wallet);
      setWallet(null);
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
    }
  };

  const handleUploadClick = () => {
    if (!wallet) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to upload tracks",
        variant: "destructive",
      });
      return;
    }
    setShowUploadDialog(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold">D-Sound</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              className="pl-10 bg-secondary"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleUploadClick}>
            <Upload className="h-5 w-5" />
          </Button>
          {wallet ? (
            <Button variant="outline" onClick={handleDisconnect}>
              {wallet.label.slice(0, 6)}...{wallet.label.slice(-4)}
            </Button>
          ) : (
            <Button onClick={handleConnect}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Track</DialogTitle>
          </DialogHeader>
          <UploadTrackForm 
            onSuccess={() => setShowUploadDialog(false)} 
            wallet={wallet}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
};
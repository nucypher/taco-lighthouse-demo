import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadTrackForm } from "@/components/UploadTrackForm";

interface UploadButtonProps {
  onUploadSuccess?: () => void;
}

export const UploadButton = ({ onUploadSuccess }: UploadButtonProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const { wallet } = useWallet();

  const handleUploadClick = () => {
    if (!wallet?.accounts?.[0]?.address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to upload tracks",
        variant: "destructive",
      });
      return;
    }

    // Check if we have both wallet and session
    if (!session?.user) {
      console.log('No session found, but wallet is connected. This should not happen.');
      toast({
        title: "Session Error",
        description: "Please try disconnecting and reconnecting your wallet",
        variant: "destructive",
      });
      return;
    }

    setShowUploadDialog(true);
  };

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={handleUploadClick} 
        className="rounded-full font-medium hidden xs:inline-flex"
      >
        Upload
      </Button>

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
    </>
  );
};
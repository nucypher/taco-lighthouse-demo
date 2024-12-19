import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadTrackForm } from "@/components/UploadTrackForm";

interface UploadButtonProps {
  onUploadSuccess?: () => void;
}

export const UploadButton = ({ onUploadSuccess }: UploadButtonProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setShowUploadDialog(true)} 
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
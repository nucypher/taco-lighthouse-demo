import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { uploadTrack } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export const UploadTrackForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      // Example TACo access conditions - these would be customized based on user input
      const accessConditions = {
        contractTxId: 'your-contract-tx-id',
        contractSourceTxId: 'your-contract-source-tx-id',
        evaluationOptions: {
          sourceType: 'wasm',
          environment: {
            // Example environment variables for access control
            allowedAddresses: ['wallet-address-1', 'wallet-address-2'],
          },
        },
      };

      await uploadTrack({
        file,
        title,
        artist: 'Current User', // This would come from the connected wallet
        accessConditions,
      });

      toast({
        title: 'Success',
        description: 'Track uploaded successfully',
      });

      // Reset form
      setFile(null);
      setTitle('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload track',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Track Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Audio File</Label>
        <Input
          id="file"
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <Button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Track'}
      </Button>
    </form>
  );
};
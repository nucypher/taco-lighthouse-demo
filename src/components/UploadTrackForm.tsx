import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
      // Temporary implementation - just simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Simulated upload:', { file, title });

      toast({
        title: 'Success',
        description: 'Track uploaded successfully',
      });

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
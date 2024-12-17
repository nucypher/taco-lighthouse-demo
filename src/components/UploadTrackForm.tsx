import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface UploadTrackFormProps {
  onSuccess?: () => void;
}

export const UploadTrackForm = ({ onSuccess }: UploadTrackFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      toast({
        title: 'Error',
        description: 'Please select an audio file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Temporary implementation - just simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form data:', {
        title,
        description,
        audioFile,
        coverArt,
      });

      toast({
        title: 'Success',
        description: 'Track uploaded successfully',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setAudioFile(null);
      setCoverArt(null);
      onSuccess?.();
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Track Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter track title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter track description"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="audioFile">Audio File</Label>
        <Input
          id="audioFile"
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          required
        />
        <p className="text-sm text-muted-foreground">
          Supported formats: MP3, WAV, FLAC
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverArt">Cover Art</Label>
        <Input
          id="coverArt"
          type="file"
          accept="image/*"
          onChange={(e) => setCoverArt(e.target.files?.[0] || null)}
        />
        <p className="text-sm text-muted-foreground">
          Recommended size: 1400x1400px
        </p>
      </div>

      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? 'Uploading...' : 'Upload Track'}
      </Button>
    </form>
  );
};
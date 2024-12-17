import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TacoConditionsForm } from './TacoConditionsForm';

interface ReturnValueTest {
  comparator: '>=' | '<=' | '>' | '<' | '=' | '!=';
  value: string;
}

interface TacoCondition {
  chain: string;
  contractAddress: string;
  standardContractType: 'ERC20' | 'ERC721' | 'ERC1155';
  method: string;
  parameters: string[];
  returnValueTest: ReturnValueTest;
}

interface UploadTrackFormProps {
  onSuccess?: () => void;
  wallet: any;
}

export const UploadTrackForm = ({ onSuccess, wallet }: UploadTrackFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [conditions, setConditions] = useState<TacoCondition[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet?.accounts?.[0]?.address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet to upload tracks',
        variant: 'destructive',
      });
      return;
    }

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
      const formData = new FormData();
      formData.append('audioFile', audioFile);
      if (coverArt) {
        formData.append('coverArt', coverArt);
      }
      if (conditions.length > 0) {
        formData.append('conditions', JSON.stringify(conditions));
      }

      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-to-lighthouse', {
        body: formData,
      });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          title,
          description,
          ipfs_cid: uploadData.audioCid,
          cover_art_cid: uploadData.coverArtCid,
          owner_id: wallet.accounts[0].address,
        });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Track uploaded successfully',
      });

      setTitle('');
      setDescription('');
      setAudioFile(null);
      setCoverArt(null);
      setConditions([]);
      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload track',
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

      <div className="space-y-2">
        <Label>Access Conditions</Label>
        <TacoConditionsForm onChange={setConditions} />
      </div>

      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? 'Uploading...' : 'Upload Track'}
      </Button>
    </form>
  );
};
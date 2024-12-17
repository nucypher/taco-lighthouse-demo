import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TacoConditionsForm } from './TacoConditionsForm';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { conditions, encrypt, domains } from '@nucypher/taco';
import { ethers } from 'ethers';

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
  const [conditions, setConditions] = useState<conditions.condition.Condition[]>([]);
  const [devMode, setDevMode] = useState(false);
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

    if (!devMode && !audioFile) {
      toast({
        title: 'Error',
        description: 'Please select an audio file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      let uploadData;
      
      if (devMode) {
        uploadData = {
          audioCid: 'test-audio-cid',
          coverArtCid: 'test-cover-art-cid',
        };
      } else {
        // Initialize Web3 provider and signer
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = web3Provider.getSigner();

        // Read the audio file as ArrayBuffer
        const audioBuffer = await audioFile!.arrayBuffer();
        
        // Encrypt the audio file using TACo if conditions are set
        let finalAudioData;
        if (conditions.length > 0) {
          const condition = conditions.reduce((acc, curr) => acc.and(curr));
          finalAudioData = await encrypt(
            web3Provider,
            domains.DEVNET,
            new Uint8Array(audioBuffer),
            condition,
            27,
            signer
          );
        } else {
          finalAudioData = audioBuffer;
        }

        // Create a new File object with the encrypted data
        const encryptedFile = new File(
          [finalAudioData], 
          audioFile!.name, 
          { type: audioFile!.type }
        );

        const formData = new FormData();
        formData.append('audioFile', encryptedFile);
        if (coverArt) {
          formData.append('coverArt', coverArt);
        }

        const { data, error: uploadError } = await supabase.functions.invoke('upload-to-lighthouse', {
          body: formData,
        });
        if (uploadError) throw uploadError;
        uploadData = data;
      }

      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          title: devMode ? 'Test Track' : title,
          description: devMode ? 'Test Description' : description,
          ipfs_cid: uploadData.audioCid,
          cover_art_cid: uploadData.coverArtCid,
          owner_id: wallet.accounts[0].address,
        });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: devMode ? 'Test track created successfully' : 'Track uploaded successfully',
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
    <div className="relative flex flex-col h-[calc(100vh-200px)]">
      <ScrollArea className="flex-1 px-4 pb-16">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="devMode"
              checked={devMode}
              onCheckedChange={setDevMode}
            />
            <Label htmlFor="devMode">Development Mode</Label>
          </div>

          {!devMode && (
            <>
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
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audioFile">Audio File</Label>
                  <Input
                    id="audioFile"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported: MP3, WAV, FLAC
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
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1400x1400px
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Access Conditions</Label>
            <div className="border rounded-md">
              <TacoConditionsForm onChange={setConditions} />
            </div>
          </div>
        </form>
      </ScrollArea>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button 
          type="submit" 
          disabled={isUploading} 
          className="w-full" 
          onClick={handleSubmit}
        >
          {isUploading ? 'Uploading...' : devMode ? 'Create Test Track' : 'Upload Track'}
        </Button>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TacoConditionsForm } from './TacoConditionsForm';
import { ScrollArea } from './ui/scroll-area';
import { conditions } from '@nucypher/taco';
import { ethers } from 'ethers';
import { Label } from './ui/label';
import { UploadFormFields } from './upload/UploadFormFields';
import { encryptAudioFile } from '@/utils/encryption';

interface UploadTrackFormProps {
  onSuccess?: () => void;
  wallet: {
    accounts?: Array<{
      address: string;
    }>;
  };
}

export const UploadTrackForm = ({ onSuccess, wallet }: UploadTrackFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [condition, setCondition] = useState<conditions.condition.Condition | null>(null);
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

    if (!condition) {
      toast({
        title: 'Error',
        description: 'Please set access conditions for the track',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('🎵 Starting track upload process...');
      console.log('📋 Upload details:', {
        title: devMode ? 'Test Track' : title,
        description: devMode ? 'Test Description' : description,
        condition
      });

      // Initialize Web3 provider and signer
      console.log('🔗 Setting up Web3 provider...');
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('✅ Web3 provider ready:', {
        network: await web3Provider.getNetwork(),
        signer: await web3Provider.getSigner().getAddress()
      });

      // Read and encrypt the audio file
      console.log('📂 Reading audio file...');
      let encryptedAudioData: ArrayBuffer;
      let coverArtBuffer: ArrayBuffer | null;

      if (devMode) {
        // Create a test buffer for dev mode
        console.log('🔧 Creating test data in dev mode...');
        const testBuffer = new ArrayBuffer(1024); // 1KB of test data
        const testView = new Uint8Array(testBuffer);
        testView.fill(0); // Fill with zeros
        encryptedAudioData = await encryptAudioFile(testBuffer, condition, web3Provider);
        coverArtBuffer = testBuffer; // Use same test buffer for cover art in dev mode
        
        console.log('📊 File sizes (dev mode):', {
          originalAudio: testBuffer.byteLength / 1024 + ' KB',
          encryptedAudio: encryptedAudioData.byteLength / 1024 + ' KB',
          coverArt: coverArtBuffer.byteLength / 1024 + ' KB'
        });
      } else {
        // Read and encrypt the actual audio file
        const audioBuffer = await audioFile!.arrayBuffer();
        console.log('✅ Audio file read, size:', (audioBuffer.byteLength / (1024 * 1024)).toFixed(2), 'MB');
        encryptedAudioData = await encryptAudioFile(audioBuffer, condition, web3Provider);
        
        // Read cover art separately (unencrypted)
        coverArtBuffer = coverArt ? await coverArt.arrayBuffer() : null;
        
        console.log('📊 File sizes:', {
          originalAudio: (audioBuffer.byteLength / (1024 * 1024)).toFixed(2) + ' MB',
          encryptedAudio: (encryptedAudioData.byteLength / (1024 * 1024)).toFixed(2) + ' MB',
          coverArt: coverArtBuffer ? (coverArtBuffer.byteLength / (1024 * 1024)).toFixed(2) + ' MB' : 'Not provided'
        });
      }

      // Send both the encrypted audio and unencrypted cover art to the Edge Function
      console.log('📤 Uploading files to Lighthouse via Edge Function...');
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-to-lighthouse', {
        body: {
          encryptedAudio: encryptedAudioData,
          coverArt: coverArtBuffer ? Array.from(new Uint8Array(coverArtBuffer)) : null,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('✅ Upload successful:', uploadData);

      console.log('💾 Saving track metadata to database...');
      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          title: devMode ? 'Test Track' : title,
          description: devMode ? 'Test Description' : description,
          ipfs_cid: uploadData.audioCid,
          cover_art_cid: uploadData.coverArtCid,
          owner_id: wallet.accounts[0].address,
        });

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw dbError;
      }

      console.log('✅ Track metadata saved successfully');
      toast({
        title: 'Success',
        description: devMode ? 'Test track created successfully' : 'Track uploaded successfully',
      });

      setTitle('');
      setDescription('');
      setAudioFile(null);
      setCoverArt(null);
      setCondition(null);
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
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
          <UploadFormFields
            devMode={devMode}
            setDevMode={setDevMode}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            setAudioFile={setAudioFile}
            setCoverArt={setCoverArt}
          />

          <div className="space-y-2">
            <Label>Access Conditions (Required)</Label>
            <div className="border rounded-md">
              <TacoConditionsForm onChange={setCondition} />
            </div>
          </div>
        </form>
      </ScrollArea>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button 
          type="submit" 
          disabled={isUploading || !condition} 
          className="w-full" 
          onClick={handleSubmit}
        >
          {isUploading ? 'Uploading...' : devMode ? 'Create Test Track' : 'Upload Track'}
        </Button>
      </div>
    </div>
  );
};
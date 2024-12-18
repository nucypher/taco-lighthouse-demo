import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { TacoConditionsForm } from "./TacoConditionsForm";
import { conditions, encrypt, domains, initialize } from '@nucypher/taco';
import { ethers } from "ethers";

interface UploadTrackFormProps {
  onSuccess?: () => void;
  wallet: {
    label?: string;
    accounts?: Array<{
      address: string;
    }>;
  } | null;
}

export const UploadTrackForm = ({ onSuccess, wallet }: UploadTrackFormProps) => {
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [condition, setCondition] = useState<conditions.condition.Condition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const devMode = false; // Set to true to use test data

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet?.accounts?.[0]?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!title || (!audioFile && !devMode)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!condition) {
      toast({
        title: "Error",
        description: "Please set access conditions",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log('🚀 Starting upload process...');

      // Initialize TACo
      console.log('🌮 Initializing TACo...');
      await initialize();
      console.log('✅ TACo initialized successfully');

      // Setup Web3 provider
      console.log('🔗 Setting up Web3 provider...');
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('✅ Web3 provider ready');

      // Read and encrypt the audio file
      console.log('📂 Reading audio file...');
      let encryptedAudioData: ArrayBuffer;
      let coverArtBuffer: ArrayBuffer | null = null;

      if (devMode) {
        // Create a test buffer for dev mode
        const testBuffer = new ArrayBuffer(1024);
        const testView = new Uint8Array(testBuffer);
        for (let i = 0; i < testView.length; i++) {
          testView[i] = i % 256;
        }
        encryptedAudioData = testBuffer;
        coverArtBuffer = testBuffer; // Use same test buffer for cover art in dev mode
        
        console.log('📊 File sizes (dev mode):', {
          originalAudio: `${testBuffer.byteLength / 1024} KB`,
          encryptedAudio: `${encryptedAudioData.byteLength / 1024} KB`,
          coverArt: `${coverArtBuffer.byteLength / 1024} KB`
        });
      } else {
        // Read and encrypt the actual audio file
        const audioBuffer = await audioFile!.arrayBuffer();
        console.log('✅ Audio file read, size:', audioBuffer.byteLength / 1024, 'KB');

        // Encrypt the audio data
        console.log('🔐 Encrypting audio data...');
        const { messageKit } = await encrypt(
          web3Provider,
          domains.DEVNET,
          new Uint8Array(audioBuffer),
          condition
        );
        encryptedAudioData = messageKit.toBytes();
        console.log('✅ Audio encrypted, size:', encryptedAudioData.byteLength / 1024, 'KB');

        // Read cover art if provided
        if (coverArt) {
          coverArtBuffer = await coverArt.arrayBuffer();
          console.log('✅ Cover art read, size:', coverArtBuffer.byteLength / 1024, 'KB');
        }
      }

      // Upload to Lighthouse via Supabase Edge Function
      console.log('📤 Uploading to Lighthouse...');
      const formData = new FormData();
      formData.append('audioData', new Blob([encryptedAudioData]));
      if (coverArtBuffer) {
        formData.append('coverArt', new Blob([coverArtBuffer]));
      }

      const response = await fetch('/functions/v1/upload-to-lighthouse', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const { audioCid, coverArtCid } = await response.json();
      console.log('✅ Upload successful:', { audioCid, coverArtCid });

      // Save track metadata to Supabase
      console.log('💾 Saving track metadata...');
      const { error: insertError } = await supabase
        .from('tracks')
        .insert({
          title,
          owner_id: wallet.accounts[0].address,
          ipfs_cid: audioCid,
          cover_art_cid: coverArtCid
        });

      if (insertError) throw insertError;
      console.log('✅ Track metadata saved successfully');

      toast({
        title: "Success",
        description: "Track uploaded successfully",
      });

      // Reset form
      setTitle("");
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
        title: "Error",
        description: error.message || "Failed to upload track",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="audio">Audio File</Label>
        <Input
          id="audio"
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover">Cover Art (optional)</Label>
        <Input
          id="cover"
          type="file"
          accept="image/*"
          onChange={(e) => setCoverArt(e.target.files?.[0] || null)}
          disabled={isUploading}
        />
      </div>

      <TacoConditionsForm
        onConditionCreated={setCondition}
        disabled={isUploading}
      />

      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? "Uploading..." : "Upload Track"}
      </Button>
    </form>
  );
};
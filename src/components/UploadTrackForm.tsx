import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { TacoConditionsForm } from "./TacoConditionsForm";
import { conditions, initialize } from '@nucypher/taco';
import { ethers } from "ethers";
import { createTestBuffer } from "@/utils/dev-mode";
import { encryptAudioData, saveTrackMetadata, uploadTrackToLighthouse } from "@/utils/upload-track";

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
  const devMode = false;

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

      await initialize();
      console.log('✅ TACo initialized successfully');

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('✅ Web3 provider ready');

      let encryptedAudioData: ArrayBuffer;
      let coverArtBuffer: ArrayBuffer | null = null;

      if (devMode) {
        const testBuffer = createTestBuffer();
        encryptedAudioData = testBuffer;
        coverArtBuffer = testBuffer;
      } else {
        const audioBuffer = await audioFile!.arrayBuffer();
        console.log('✅ Audio file read, size:', audioBuffer.byteLength / 1024, 'KB');

        encryptedAudioData = await encryptAudioData(audioBuffer, condition, web3Provider);
        console.log('✅ Audio encrypted, size:', encryptedAudioData.byteLength / 1024, 'KB');

        if (coverArt) {
          coverArtBuffer = await coverArt.arrayBuffer();
          console.log('✅ Cover art read, size:', coverArtBuffer.byteLength / 1024, 'KB');
        }
      }

      const formData = new FormData();
      const { audioCid, coverArtCid } = await uploadTrackToLighthouse(
        encryptedAudioData,
        coverArtBuffer,
        formData
      );
      console.log('✅ Upload successful:', { audioCid, coverArtCid });

      await saveTrackMetadata(
        title,
        wallet.accounts[0].address,
        audioCid,
        coverArtCid
      );
      console.log('✅ Track metadata saved successfully');

      toast({
        title: "Success",
        description: "Track uploaded successfully",
      });

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
        onChange={setCondition}
        disabled={isUploading}
      />

      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? "Uploading..." : "Upload Track"}
      </Button>
    </form>
  );
};
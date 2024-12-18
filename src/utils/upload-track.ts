import { conditions } from '@nucypher/taco';
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";
import { encryptAudioFile } from './encryption';

export async function uploadTrackToLighthouse(
  audioData: ArrayBuffer,
  coverArtData: ArrayBuffer | null,
  formData: FormData
): Promise<{ audioCid: string; coverArtCid?: string }> {
  formData.append('audioData', new Blob([audioData]));
  if (coverArtData) {
    formData.append('coverArt', new Blob([coverArtData]));
  }

  const response = await fetch('/functions/v1/upload-to-lighthouse', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function encryptAudioData(
  audioBuffer: ArrayBuffer,
  condition: conditions.condition.Condition,
  provider: ethers.providers.Web3Provider
): Promise<ArrayBuffer> {
  return encryptAudioFile(audioBuffer, condition, provider);
}

export async function saveTrackMetadata(
  title: string,
  ownerId: string,
  audioCid: string,
  coverArtCid?: string
) {
  const { error } = await supabase
    .from('tracks')
    .insert({
      title,
      owner_id: ownerId,
      ipfs_cid: audioCid,
      cover_art_cid: coverArtCid
    });

  if (error) throw error;
}
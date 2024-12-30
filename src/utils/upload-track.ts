import { tracksClient } from "@/integrations/orbis/utils";
import { supabase } from "@/integrations/supabase/client";

export async function uploadTrackToLighthouse(
  audioData: ArrayBuffer,
  coverArtData: ArrayBuffer | null
): Promise<{ audioCid: string; coverArtCid?: string }> {
  console.log('Starting upload to Lighthouse...', {
    audioDataSize: audioData.byteLength,
    hasCoverArt: !!coverArtData
  });

  const { data, error } = await supabase.functions.invoke('upload-to-lighthouse', {
    body: {
      audioData: Array.from(new Uint8Array(audioData)),
      coverArtData: coverArtData ? Array.from(new Uint8Array(coverArtData)) : null
    }
  });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }

  if (!data) {
    throw new Error('No response data received from upload');
  }

  console.log('Upload successful:', data);
  return data;
}

export async function saveTrackMetadata(
  title: string,
  ownerId: string,
  audioCid: string,
  coverArtCid?: string
) {
  console.log('Saving track metadata to Orbis:', {
    title,
    ownerId,
    audioCid,
    coverArtCid
  });

  await tracksClient.createTrack({
    title,
    ipfsCID: audioCid,
    artworkCID: coverArtCid,
    owner_id: ownerId
  });
}
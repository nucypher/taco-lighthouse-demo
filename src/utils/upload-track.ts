import { supabase } from "@/integrations/supabase/client";

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
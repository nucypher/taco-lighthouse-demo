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

  const { data, error } = await supabase.functions.invoke('upload-to-lighthouse', {
    body: formData
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return data;
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
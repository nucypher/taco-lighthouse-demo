import { tracksClient } from "@/integrations/orbis/utils";

export async function uploadTrackToLighthouse(
  audioData: ArrayBuffer,
  coverArtData: ArrayBuffer | null,
  formData: FormData
): Promise<{ audioCid: string; coverArtCid?: string }> {
  const formDataToSend = new FormData();
  formDataToSend.append('audioData', new Blob([audioData]));
  
  if (coverArtData) {
    formDataToSend.append('coverArt', new Blob([coverArtData]));
  }

  const response = await fetch('/api/upload-to-lighthouse', {
    method: 'POST',
    body: formDataToSend
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Upload failed: ${errorData.message || 'Unknown error'}`);
  }

  return await response.json();
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
    owner_id: ownerId,
    ipfs_cid: audioCid,
    cover_art_cid: coverArtCid
  });
}
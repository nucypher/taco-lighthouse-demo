import { tracksClient } from "@/integrations/orbis/utils";

export async function uploadTrackToLighthouse(
  audioData: ArrayBuffer,
  coverArtData: ArrayBuffer | null,
  formData: FormData
): Promise<{ audioCid: string; coverArtCid?: string }> {
  formData.append('audioData', new Blob([audioData]));
  if (coverArtData) {
    formData.append('coverArt', new Blob([coverArtData]));
  }

  const response = await fetch('/api/upload-to-lighthouse', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Upload failed: ${errorData.message}`);
  }

  // Store the JSON response in a variable to avoid consuming it twice
  const responseData = await response.json();
  return responseData;
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
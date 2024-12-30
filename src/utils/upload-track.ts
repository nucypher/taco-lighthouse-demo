import { tracksClient } from "@/integrations/orbis/utils";

export async function uploadTrackToLighthouse(
  audioData: ArrayBuffer,
  coverArtData: ArrayBuffer | null,
  formData: FormData
): Promise<{ audioCid: string; coverArtCid?: string }> {
  const apiKey = process.env.LIGHTHOUSE_API_KEY;
  
  // Upload encrypted audio to Lighthouse
  const audioFormData = new FormData();
  audioFormData.append('file', new Blob([audioData]));

  console.log('Uploading encrypted audio to Lighthouse...');
  const audioUploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: audioFormData
  });

  if (!audioUploadResponse.ok) {
    const errorData = await audioUploadResponse.json();
    throw new Error(`Audio upload failed: ${errorData.message || 'Unknown error'}`);
  }

  const audioUploadData = await audioUploadResponse.json();
  console.log('Audio upload successful:', audioUploadData);

  let coverArtCid = undefined;
  if (coverArtData) {
    // Upload cover art to Lighthouse
    const coverArtFormData = new FormData();
    coverArtFormData.append('file', new Blob([coverArtData]));

    console.log('Uploading cover art to Lighthouse...');
    const coverArtUploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: coverArtFormData
    });

    if (!coverArtUploadResponse.ok) {
      const errorData = await coverArtUploadResponse.json();
      throw new Error(`Cover art upload failed: ${errorData.message || 'Unknown error'}`);
    }

    const coverArtUploadData = await coverArtUploadResponse.json();
    coverArtCid = coverArtUploadData.Hash;
    console.log('Cover art upload successful:', coverArtUploadData);
  }

  return {
    audioCid: audioUploadData.Hash,
    coverArtCid
  };
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
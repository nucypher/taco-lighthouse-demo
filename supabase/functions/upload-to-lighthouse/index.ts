import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the JSON payload containing both encrypted audio and cover art
    const { encryptedAudio, coverArt } = await req.json();
    
    // Convert encryptedAudio back to Uint8Array
    const audioData = new Uint8Array(encryptedAudio);
    
    // Create a blob from the encrypted audio data
    const audioBlob = new Blob([audioData], { type: 'application/octet-stream' });
    
    // Create FormData for Lighthouse
    const formData = new FormData();
    formData.append('file', audioBlob, 'encrypted-audio.bin');

    // Upload encrypted audio to Lighthouse
    console.log('Uploading encrypted audio to Lighthouse...');
    const audioUploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
      },
      body: formData,
    });

    if (!audioUploadResponse.ok) {
      throw new Error('Failed to upload encrypted audio to Lighthouse');
    }

    const audioUploadData = await audioUploadResponse.json();
    console.log('Audio upload successful:', audioUploadData);

    let coverArtCid = null;
    if (coverArt) {
      // Convert coverArt back to Uint8Array
      const coverArtData = new Uint8Array(coverArt);
      
      // Create a blob from the cover art data
      const coverArtBlob = new Blob([coverArtData], { type: 'image/jpeg' });
      
      // Create new FormData for cover art
      const coverArtFormData = new FormData();
      coverArtFormData.append('file', coverArtBlob, 'cover-art.jpg');

      // Upload cover art to Lighthouse
      console.log('Uploading cover art to Lighthouse...');
      const coverArtUploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
        },
        body: coverArtFormData,
      });

      if (!coverArtUploadResponse.ok) {
        throw new Error('Failed to upload cover art to Lighthouse');
      }

      const coverArtUploadData = await coverArtUploadResponse.json();
      coverArtCid = coverArtUploadData.Hash;
      console.log('Cover art upload successful:', coverArtUploadData);
    }

    return new Response(
      JSON.stringify({
        audioCid: audioUploadData.Hash,
        coverArtCid
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
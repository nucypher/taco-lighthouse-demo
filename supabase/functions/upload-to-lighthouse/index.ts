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
    console.log('Received upload request');
    const body = await req.json();
    const { audioData, coverArtData } = body;

    if (!audioData) {
      console.error('No audio data provided');
      throw new Error('No audio data provided');
    }

    console.log('Creating audio blob...');
    // Convert Uint8Array data back to a blob
    const audioBlob = new Blob([new Uint8Array(audioData)], { type: 'audio/mpeg' });

    // Create form data for Lighthouse
    const audioFormData = new FormData();
    audioFormData.append('file', audioBlob, 'audio.mp3');

    console.log('Uploading audio to Lighthouse...');
    const audioUploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
      },
      body: audioFormData
    });

    if (!audioUploadResponse.ok) {
      throw new Error(`Failed to upload audio: ${audioUploadResponse.statusText}`);
    }

    const audioUploadData = await audioUploadResponse.json();
    console.log('Audio upload successful:', audioUploadData);

    let coverArtCid = null;
    if (coverArtData) {
      console.log('Creating cover art blob...');
      const coverArtBlob = new Blob([new Uint8Array(coverArtData)], { type: 'image/jpeg' });
      
      const coverArtFormData = new FormData();
      coverArtFormData.append('file', coverArtBlob, 'cover.jpg');

      console.log('Uploading cover art to Lighthouse...');
      const coverArtUploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
        },
        body: coverArtFormData
      });

      if (!coverArtUploadResponse.ok) {
        throw new Error(`Failed to upload cover art: ${coverArtUploadResponse.statusText}`);
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
        status: 200
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Upload failed', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
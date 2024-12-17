import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function base64ToFile(base64Data: string, filename: string, type: string): Promise<File> {
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type });
  return new File([blob], filename, { type });
}

async function uploadToLighthouse(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch("https://node.lighthouse.storage/api/v0/add", {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to Lighthouse: ${response.statusText}`);
  }

  const result = await response.json();
  return result.Hash;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Received request body:', body);

    if (!body.audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Convert base64 back to File objects
    console.log('Converting audio file from base64...');
    const audioFile = await base64ToFile(
      body.audioFile.data,
      body.audioFile.name,
      body.audioFile.type
    );

    console.log('Uploading audio file to Lighthouse...');
    const audioCid = await uploadToLighthouse(audioFile);
    console.log('Audio file uploaded, CID:', audioCid);

    let coverArtCid = null;
    if (body.coverArt) {
      console.log('Converting cover art from base64...');
      const coverArtFile = await base64ToFile(
        body.coverArt.data,
        body.coverArt.name,
        body.coverArt.type
      );

      console.log('Uploading cover art to Lighthouse...');
      coverArtCid = await uploadToLighthouse(coverArtFile);
      console.log('Cover art uploaded, CID:', coverArtCid);
    }

    return new Response(
      JSON.stringify({ 
        audioCid,
        coverArtCid 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error uploading to Lighthouse:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
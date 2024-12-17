import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const formData = await req.formData();
    const audioFile = formData.get('audioFile') as File;
    const coverArt = formData.get('coverArt') as File;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Uploading audio file to Lighthouse...');
    const audioCid = await uploadToLighthouse(audioFile);
    console.log('Audio file uploaded, CID:', audioCid);

    let coverArtCid = null;
    if (coverArt) {
      console.log('Uploading cover art to Lighthouse...');
      coverArtCid = await uploadToLighthouse(coverArt);
      console.log('Cover art uploaded, CID:', coverArtCid);
    }

    return new Response(
      JSON.stringify({ 
        audioCid,
        coverArtCid 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error uploading to Lighthouse:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
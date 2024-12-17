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
    // Get the encrypted audio data as binary
    const encryptedData = await req.arrayBuffer();
    
    // Create a blob from the encrypted data
    const audioBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
    
    // Create FormData for Lighthouse
    const formData = new FormData();
    formData.append('file', audioBlob, 'encrypted-audio.bin');

    // Upload to Lighthouse
    const uploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to Lighthouse');
    }

    const uploadData = await uploadResponse.json();
    console.log('Upload successful:', uploadData);

    return new Response(
      JSON.stringify({
        audioCid: uploadData.Hash,
        coverArtCid: null // We'll handle cover art separately if needed
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
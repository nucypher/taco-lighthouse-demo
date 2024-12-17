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
    const formData = await req.formData()
    const audioFile = formData.get('audioFile')
    const coverArt = formData.get('coverArt')
    
    if (!audioFile) {
      throw new Error('No audio file provided')
    }

    // Upload file to Lighthouse
    const formDataLighthouse = new FormData()
    formDataLighthouse.append('file', audioFile)

    const uploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
      },
      body: formDataLighthouse,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to Lighthouse')
    }

    const uploadData = await uploadResponse.json()
    let coverArtCid = null

    // Upload cover art if provided
    if (coverArt) {
      const coverFormData = new FormData()
      coverFormData.append('file', coverArt)
      
      const coverResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
        },
        body: coverFormData,
      })

      if (!coverResponse.ok) {
        throw new Error('Failed to upload cover art')
      }

      const coverData = await coverResponse.json()
      coverArtCid = coverData.Hash
    }

    // Return the CIDs
    return new Response(
      JSON.stringify({
        audioCid: uploadData.Hash,
        coverArtCid
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
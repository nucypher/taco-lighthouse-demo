import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { audioData, coverArtData } = await req.json()

    if (!audioData) {
      throw new Error('No audio data provided')
    }

    // Convert array back to Uint8Array
    const audioBuffer = new Uint8Array(audioData).buffer
    
    // Upload encrypted audio to Lighthouse
    const audioFormData = new FormData()
    audioFormData.append('file', new Blob([audioBuffer]))

    console.log('Uploading encrypted audio to Lighthouse...')
    const audioUploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
      },
      body: audioFormData
    })

    if (!audioUploadResponse.ok) {
      throw new Error(`Failed to upload audio: ${audioUploadResponse.statusText}`)
    }

    const audioUploadData = await audioUploadResponse.json()
    console.log('Audio upload successful:', audioUploadData)

    let coverArtCid = null
    if (coverArtData) {
      // Convert array back to Uint8Array for cover art
      const coverArtBuffer = new Uint8Array(coverArtData).buffer
      
      // Upload cover art to Lighthouse
      const coverArtFormData = new FormData()
      coverArtFormData.append('file', new Blob([coverArtBuffer]))

      console.log('Uploading cover art to Lighthouse...')
      const coverArtUploadResponse = await fetch('https://node.lighthouse.storage/api/v0/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LIGHTHOUSE_API_KEY')}`,
        },
        body: coverArtFormData
      })

      if (!coverArtUploadResponse.ok) {
        throw new Error(`Failed to upload cover art: ${coverArtUploadResponse.statusText}`)
      }

      const coverArtUploadData = await coverArtUploadResponse.json()
      coverArtCid = coverArtUploadData.Hash
      console.log('Cover art upload successful:', coverArtUploadData)
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
    )
  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
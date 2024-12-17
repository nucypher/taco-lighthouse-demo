import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { conditions, encrypt } from 'https://esm.sh/@nucypher/taco'

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
    const conditionsStr = formData.get('conditions')
    
    if (!audioFile) {
      throw new Error('No audio file provided')
    }

    // Parse conditions
    let accessConditions = []
    if (conditionsStr) {
      const parsedConditions = JSON.parse(conditionsStr)
      accessConditions = parsedConditions.map((condition: any) => {
        if (condition.standardContractType === 'ERC20') {
          return new conditions.predefined.erc20.ERC20Balance({
            contractAddress: condition.contractAddress,
            chain: condition.chain,
            returnValueTest: condition.returnValueTest
          })
        } else {
          return new conditions.predefined.erc721.ERC721Balance({
            contractAddress: condition.contractAddress,
            chain: condition.chain,
            returnValueTest: condition.returnValueTest
          })
        }
      })
    }

    // Encrypt the audio file
    const audioBuffer = await audioFile.arrayBuffer()
    const { encryptedFile, decryptionConditions } = await encrypt(
      new Uint8Array(audioBuffer),
      accessConditions
    )

    // Upload encrypted file to Lighthouse
    const formDataLighthouse = new FormData()
    formDataLighthouse.append(
      'file', 
      new Blob([encryptedFile], { type: audioFile.type }), 
      'encrypted-' + audioFile.name
    )

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

    // Return both the CID and the decryption conditions
    return new Response(
      JSON.stringify({
        audioCid: uploadData.Hash,
        coverArtCid,
        decryptionConditions
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
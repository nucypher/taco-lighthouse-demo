import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { generateNonce } from 'npm:siwe@2'

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
    const nonce = generateNonce()
    console.log('Generated nonce:', nonce)
    
    return new Response(nonce, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error('Error generating nonce:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})
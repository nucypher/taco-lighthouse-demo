import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SiweMessage } from 'npm:siwe@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { address, message, signature } = await req.json()
    console.log('Received SIWE auth request:', { address, message, signature });

    // Verify SIWE message first
    const siweMessage = new SiweMessage(message)
    const fields = await siweMessage.verify({ signature })
    console.log('SIWE verification result:', fields);

    if (!fields.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate a deterministic email from the wallet address
    const email = `${address.toLowerCase()}@ethereum.local`

    // Check if user exists
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.users.find(u => u.email === email)
    
    let user;
    if (existingUser) {
      user = existingUser
      console.log('Found existing user:', user);
    } else {
      // Create new user if doesn't exist
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirmed: true,
        user_metadata: {
          wallet_address: address.toLowerCase(),
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }
      
      user = newUser
      console.log('Created new user:', user);
    }

    // Generate session for the user
    const { data: { session }, error: sessionError } = await supabaseAdmin.auth.admin
      .createSession(user.id)

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      throw sessionError
    }

    return new Response(
      JSON.stringify({ user, session }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
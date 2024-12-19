import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { SiweMessage } from "npm:siwe@2"

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
    const { address, message, signature } = await req.json()
    console.log('Received SIWE auth request:', { address, message });

    // Verify SIWE message
    const siweMessage = new SiweMessage(message)
    const fields = await siweMessage.verify({ signature })
    
    if (!fields.success) {
      console.error('SIWE verification failed:', fields);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('SIWE verification successful:', fields);

    // Initialize Supabase admin client
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

    // Normalize the wallet address
    const normalizedAddress = address.toLowerCase()
    const email = `${normalizedAddress}@ethereum.local`

    // First try to get the user
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    })

    if (getUserError) {
      console.error('Error fetching user:', getUserError);
      throw getUserError;
    }

    let user = users?.[0];

    if (!user) {
      // Create new user if doesn't exist
      console.log('Creating new user with email:', email);
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirmed: true,
        user_metadata: {
          eth_address: normalizedAddress,
          siwe_nonce: fields.data.nonce
        },
        app_metadata: {
          provider: 'siwe'
        }
      })

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      user = newUser;
      console.log('Created new user:', user);
    } else {
      // Update existing user's metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            eth_address: normalizedAddress,
            siwe_nonce: fields.data.nonce
          }
        }
      )

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }
      console.log('Updated existing user:', user);
    }

    // Create a session for the user using admin API
    const { data: { session }, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      userId: user.id
    })

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }

    console.log('Created session successfully');

    return new Response(
      JSON.stringify({ 
        user,
        session
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in SIWE auth:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
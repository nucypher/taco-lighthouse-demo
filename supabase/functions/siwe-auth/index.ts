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

    // Verify SIWE message
    const siweMessage = new SiweMessage(message)
    const fields = await siweMessage.verify({ signature })
    console.log('SIWE verification result:', fields);

    if (!fields.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First check if a user with this email already exists
    const email = `${address.toLowerCase()}@ethereum.org`
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = existingAuthUser?.users?.find(u => u.email === email)

    let user
    if (!authUser) {
      // Create new auth user if doesn't exist
      console.log('Creating new auth user for:', email)
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          wallet_address: address.toLowerCase()
        }
      })

      if (createError) {
        console.error('Error creating auth user:', createError)
        throw createError
      }
      user = newUser
      console.log('Created new auth user:', user)
    } else {
      user = authUser
      console.log('Found existing auth user:', user)
    }

    // Check if user exists in our users table
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .single()

    console.log('Existing user check:', { existingUser, selectError });

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError
    }

    if (!existingUser) {
      // Create new user if doesn't exist
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          wallet_address: address.toLowerCase(),
          auth: {
            lastAuth: new Date().toISOString(),
            lastAuthStatus: 'success',
            genNonce: siweMessage.nonce
          }
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating new user:', insertError)
        throw insertError
      }
      console.log('Created new user:', newUser);
    } else {
      // Update existing user's auth data
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          auth: {
            lastAuth: new Date().toISOString(),
            lastAuthStatus: 'success',
            genNonce: siweMessage.nonce
          }
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('Error updating user:', updateError)
        throw updateError
      }
      console.log('Updated existing user auth data');
    }

    return new Response(
      JSON.stringify({ user }),
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
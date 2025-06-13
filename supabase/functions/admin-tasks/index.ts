
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, user_metadata, user_id } = await req.json()

    console.log('Admin task received:', { action, email, user_id })

    if (action === 'invite_user') {
      if (!email || !user_metadata) {
        throw new Error('Email e metadados são obrigatórios para convite')
      }

      // Invite user using admin API
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: user_metadata,
        redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/`
      })

      if (error) {
        console.error('Erro ao convidar usuário:', error)
        throw error
      }

      console.log('Usuário convidado com sucesso:', data)

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'delete_user') {
      if (!user_id) {
        throw new Error('ID do usuário é obrigatório para exclusão')
      }

      // First, delete from profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user_id)

      if (profileError) {
        console.error('Erro ao excluir perfil:', profileError)
        throw profileError
      }

      // Then delete from auth
      const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

      if (error) {
        console.error('Erro ao excluir usuário do auth:', error)
        throw error
      }

      console.log('Usuário excluído com sucesso:', data)

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error(`Ação não suportada: ${action}`)

  } catch (error) {
    console.error('Erro na edge function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

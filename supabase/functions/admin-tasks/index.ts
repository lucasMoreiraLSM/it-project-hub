
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
        return new Response(
          JSON.stringify({ 
            error: 'Email e metadados são obrigatórios para convite',
            code: 'missing_fields'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      // Invite user using admin API
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: user_metadata,
        redirectTo: `${req.headers.get('origin') || 'https://it-project-hub.lovable.app'}/`
      })

      if (error) {
        console.error('Erro ao convidar usuário:', error)
        
        let errorMessage = 'Erro ao enviar convite'
        let errorCode = 'invite_failed'
        
        if (error.message?.includes('email_exists') || error.message?.includes('already been registered')) {
          errorMessage = 'Um usuário com este email já está registrado no sistema'
          errorCode = 'email_exists'
        }
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            code: errorCode,
            details: error.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 422,
          }
        )
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
        return new Response(
          JSON.stringify({ 
            error: 'ID do usuário é obrigatório para exclusão',
            code: 'missing_user_id'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      // First, delete from profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user_id)

      if (profileError) {
        console.error('Erro ao excluir perfil:', profileError)
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao excluir perfil do usuário',
            code: 'profile_delete_failed',
            details: profileError.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      // Then delete from auth
      const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

      if (error) {
        console.error('Erro ao excluir usuário do auth:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao excluir usuário do sistema de autenticação',
            code: 'auth_delete_failed',
            details: error.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
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

    return new Response(
      JSON.stringify({ 
        error: `Ação não suportada: ${action}`,
        code: 'unsupported_action'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Erro na edge function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        code: 'internal_error',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

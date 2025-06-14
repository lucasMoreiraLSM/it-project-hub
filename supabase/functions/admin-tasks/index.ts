
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./utils.ts"
import { handleInviteUser } from "./handlers/inviteUser.ts"
import { handleDeleteUser } from "./handlers/deleteUser.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Clone the request to allow reading the body multiple times
    const body = await req.json()
    const { action } = body

    console.log('Admin task received:', { action })

    switch (action) {
      case 'invite_user':
        return await handleInviteUser(req, body)
      case 'delete_user':
        return await handleDeleteUser(body)
      default:
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
    }
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

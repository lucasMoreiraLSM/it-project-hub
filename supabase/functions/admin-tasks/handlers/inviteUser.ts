
import { corsHeaders, createSupabaseAdmin } from '../utils.ts'

export async function handleInviteUser(req: Request, body: { email: string, user_metadata: unknown }) {
  const { email, user_metadata } = body;

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

  const supabaseAdmin = createSupabaseAdmin()
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: user_metadata,
    redirectTo: `${req.headers.get('origin') || 'https://it-project-hub.lovable.app'}/accept-invite`
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

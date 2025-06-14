
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

      console.log(`Iniciando exclusão do usuário: ${user_id}`)

      // First, check if user exists in profiles
      const { data: userProfile, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, nome')
        .eq('id', user_id)
        .single()

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('Erro ao verificar perfil do usuário:', profileCheckError)
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao verificar dados do usuário',
            code: 'profile_check_failed',
            details: profileCheckError.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      if (!userProfile) {
        console.log('Usuário não encontrado na tabela profiles, continuando com exclusão do auth')
      } else {
        console.log(`Usuário encontrado: ${userProfile.email} - ${userProfile.nome}`)
      }

      // Check for dependencies - projects created by user
      const { data: createdProjects, error: createdProjectsError } = await supabaseAdmin
        .from('projetos')
        .select('id, nome')
        .eq('created_by_user_id', user_id)

      if (createdProjectsError) {
        console.error('Erro ao verificar projetos criados pelo usuário:', createdProjectsError)
      } else if (createdProjects && createdProjects.length > 0) {
        console.log(`Usuário possui ${createdProjects.length} projeto(s) criado(s):`, createdProjects.map(p => p.nome))
        
        // Update projects to remove user reference instead of blocking deletion
        const { error: updateCreatedError } = await supabaseAdmin
          .from('projetos')
          .update({ created_by_user_id: null })
          .eq('created_by_user_id', user_id)

        if (updateCreatedError) {
          console.error('Erro ao atualizar projetos criados:', updateCreatedError)
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao atualizar projetos criados pelo usuário',
              code: 'update_projects_failed',
              details: updateCreatedError.message
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }
        console.log('Projetos criados atualizados com sucesso')
      }

      // Check for projects where user is leader
      const { data: leaderProjects, error: leaderProjectsError } = await supabaseAdmin
        .from('projetos')
        .select('id, nome')
        .eq('lider_projeto_user_id', user_id)

      if (leaderProjectsError) {
        console.error('Erro ao verificar projetos liderados pelo usuário:', leaderProjectsError)
      } else if (leaderProjects && leaderProjects.length > 0) {
        console.log(`Usuário é líder de ${leaderProjects.length} projeto(s):`, leaderProjects.map(p => p.nome))
        
        // Update projects to remove user reference
        const { error: updateLeaderError } = await supabaseAdmin
          .from('projetos')
          .update({ lider_projeto_user_id: null })
          .eq('lider_projeto_user_id', user_id)

        if (updateLeaderError) {
          console.error('Erro ao atualizar projetos liderados:', updateLeaderError)
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao atualizar projetos liderados pelo usuário',
              code: 'update_leader_projects_failed',
              details: updateLeaderError.message
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }
        console.log('Projetos liderados atualizados com sucesso')
      }

      // Check for projects where user is manager
      const { data: managerProjects, error: managerProjectsError } = await supabaseAdmin
        .from('projetos')
        .select('id, nome')
        .eq('gerente_projetos_user_id', user_id)

      if (managerProjectsError) {
        console.error('Erro ao verificar projetos gerenciados pelo usuário:', managerProjectsError)
      } else if (managerProjects && managerProjects.length > 0) {
        console.log(`Usuário é gerente de ${managerProjects.length} projeto(s):`, managerProjects.map(p => p.nome))
        
        // Update projects to remove user reference
        const { error: updateManagerError } = await supabaseAdmin
          .from('projetos')
          .update({ gerente_projetos_user_id: null })
          .eq('gerente_projetos_user_id', user_id)

        if (updateManagerError) {
          console.error('Erro ao atualizar projetos gerenciados:', updateManagerError)
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao atualizar projetos gerenciados pelo usuário',
              code: 'update_manager_projects_failed',
              details: updateManagerError.message
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }
        console.log('Projetos gerenciados atualizados com sucesso')
      }

      // Clean up project locks
      const { error: lockCleanupError } = await supabaseAdmin
        .from('project_locks')
        .delete()
        .eq('user_id', user_id)

      if (lockCleanupError) {
        console.error('Erro ao limpar locks do usuário:', lockCleanupError)
      } else {
        console.log('Locks do usuário removidos com sucesso')
      }

      // Clean up project history
      const { error: historyCleanupError } = await supabaseAdmin
        .from('project_history')
        .delete()
        .eq('user_id', user_id)

      if (historyCleanupError) {
        console.error('Erro ao limpar histórico do usuário:', historyCleanupError)
      } else {
        console.log('Histórico do usuário removido com sucesso')
      }

      // Delete from profiles table
      if (userProfile) {
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
        console.log('Perfil excluído com sucesso')
      }

      // Finally, delete from auth
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

      console.log('Usuário excluído com sucesso do sistema de autenticação:', data)

      return new Response(
        JSON.stringify({ 
          success: true, 
          data,
          message: 'Usuário e todas as dependências foram removidos com sucesso'
        }),
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

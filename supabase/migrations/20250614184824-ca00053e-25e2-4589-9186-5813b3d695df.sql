
-- Altera a função de verificação de permissão para permitir que qualquer usuário autenticado edite um projeto.
CREATE OR REPLACE FUNCTION public.can_edit_project(project_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  -- Retorna 'true' diretamente, concedendo permissão de edição a todos.
  SELECT true;
$$;


-- Criar enum para os perfis de acesso
CREATE TYPE public.user_profile AS ENUM ('administrador', 'gerencia', 'colaborador');

-- Atualizar a tabela profiles para incluir o perfil de acesso
ALTER TABLE public.profiles 
ADD COLUMN perfil public.user_profile NOT NULL DEFAULT 'colaborador';

-- Adicionar campos para controle de criação/edição de projetos
ALTER TABLE public.projetos 
ADD COLUMN created_by_user_id uuid REFERENCES auth.users(id),
ADD COLUMN lider_projeto_user_id uuid REFERENCES auth.users(id),
ADD COLUMN gerente_projetos_user_id uuid REFERENCES auth.users(id);

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;

-- Função para verificar perfil do usuário
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS public.user_profile
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT perfil FROM public.profiles WHERE id = user_id;
$$;

-- Função para verificar se usuário pode editar projeto
CREATE OR REPLACE FUNCTION public.can_edit_project(project_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projetos p
    JOIN public.profiles prof ON prof.id = user_id
    WHERE p.id = project_id
    AND (
      prof.perfil = 'administrador'
      OR (prof.perfil = 'gerencia' AND p.gerente_projetos_user_id = user_id)
      OR (prof.perfil = 'colaborador' AND (p.created_by_user_id = user_id OR p.lider_projeto_user_id = user_id))
    )
  );
$$;

-- Função para verificar se usuário pode excluir projeto
CREATE OR REPLACE FUNCTION public.can_delete_project(project_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND perfil IN ('administrador', 'gerencia')
  );
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND perfil = 'administrador'
    )
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Políticas RLS para projetos
CREATE POLICY "Users can view all projects" ON public.projetos
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON public.projetos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can update projects" ON public.projetos
  FOR UPDATE USING (public.can_edit_project(id, auth.uid()));

CREATE POLICY "Authorized users can delete projects" ON public.projetos
  FOR DELETE USING (public.can_delete_project(id, auth.uid()));

-- Atualizar projetos existentes para definir o criador
UPDATE public.projetos 
SET created_by_user_id = user_id 
WHERE user_id IS NOT NULL;

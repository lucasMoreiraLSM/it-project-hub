
-- This migration implements the first phase of critical security fixes identified in the security review.

-- 1. Restore the secure 'can_edit_project' function.
-- This corrects a critical vulnerability where any authenticated user could edit any project.
-- The restored function enforces proper role-based access control.
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
      prof.perfil = 'administrador' OR
      (prof.perfil = 'gerencia' AND p.gerente_projetos_user_id = user_id) OR
      (prof.perfil = 'colaborador' AND (p.created_by_user_id = user_id OR p.lider_projeto_user_id = user_id))
    )
  );
$$;

-- 2. Re-apply the RLS policy on the 'projetos' table to use the secure function.
-- This ensures the new access control logic is enforced for all update operations.
DROP POLICY IF EXISTS "Authorized users can update projects" ON public.projetos;
CREATE POLICY "Authorized users can update projects" ON public.projetos
  FOR UPDATE USING (public.can_edit_project(id, auth.uid()));


-- 3. Fix data exposure and potential recursion in 'profiles' RLS policies.

-- First, fix the "Admins can update all profiles" policy to prevent a potential infinite recursion issue.
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_profile(auth.uid()) = 'administrador');

-- Second, fix the "Users can view all profiles" policy, which previously exposed all user data.
-- The new policy restricts access so users can only view their own profile, while admins can view all.
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile, admins can view all" ON public.profiles
  FOR SELECT USING (
    (id = auth.uid()) OR (public.get_user_profile(auth.uid()) = 'administrador')
  );

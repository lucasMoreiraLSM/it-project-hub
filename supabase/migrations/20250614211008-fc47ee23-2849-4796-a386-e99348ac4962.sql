
-- This migration changes the project editing permissions
-- to allow any authenticated user to edit any project.

CREATE OR REPLACE FUNCTION public.can_edit_project(project_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  -- Returns 'true' if a user_id is provided, which means the user is authenticated.
  -- This grants edit permission to all logged-in users for any project.
  SELECT user_id IS NOT NULL;
$$;

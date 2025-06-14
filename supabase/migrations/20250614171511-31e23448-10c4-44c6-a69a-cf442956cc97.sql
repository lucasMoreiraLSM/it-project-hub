
-- Altera o valor padrão do perfil na tabela de usuários para 'colaborador'
ALTER TABLE public.profiles
ALTER COLUMN perfil SET DEFAULT 'colaborador'::user_profile;

-- Atualiza a função de gatilho que cria um perfil para um novo usuário
-- para que leia e salve o perfil correto enviado no convite.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, nome, perfil)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'nome', ''),
    COALESCE(
      (NEW.raw_user_meta_data ->> 'perfil'),
      'colaborador'
    )::public.user_profile
  );
  RETURN NEW;
END;
$function$;

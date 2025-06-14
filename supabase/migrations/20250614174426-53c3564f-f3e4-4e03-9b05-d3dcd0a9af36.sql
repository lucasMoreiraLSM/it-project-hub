
-- Adiciona uma coluna para rastrear se a senha foi definida
ALTER TABLE public.profiles
ADD COLUMN password_set BOOLEAN NOT NULL DEFAULT false;

-- Marca os usuários existentes como tendo uma senha definida.
-- Esta é uma suposição para evitar interromper os usuários atuais.
-- Novos usuários convidados terão este campo como 'false' até definirem uma senha.
UPDATE public.profiles SET password_set = true;

-- Atualiza a função que cria perfis para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, nome, perfil, password_set)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'nome', ''),
    COALESCE(
      (NEW.raw_user_meta_data ->> 'perfil'),
      'colaborador'
    )::public.user_profile,
    false -- Inicia como falso para todos os novos usuários
  );
  RETURN NEW;
END;
$function$

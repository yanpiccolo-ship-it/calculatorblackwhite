-- =====================================================================
--  Conviérteme en administrador
--  Cambia 'TU_EMAIL@dresstyle.world' por el email con el que te
--  registraste en Supabase y ejecuta esta consulta.
-- =====================================================================

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'yanpicolo@gmail.com'
on conflict (user_id, role) do nothing;

-- Verificación: deberías ver tu email con role = admin
select u.email, ur.role, ur.created_at
from public.user_roles ur
join auth.users u on u.id = ur.user_id
where ur.role = 'admin';

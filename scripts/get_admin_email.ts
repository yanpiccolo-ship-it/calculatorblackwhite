import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.SUPABASE_URL!, process.env.SERVICE_ROLE_KEY!, { auth: { persistSession: false }});
const { data: roles, error } = await sb.from('user_roles').select('user_id').eq('role', 'admin');
if (error) { console.log('roles ERR:', error.message); process.exit(1); }
console.log('admin user_ids:', JSON.stringify(roles));
const ids = roles?.map(r => r.user_id) || [];
for (const id of ids) {
  const u = await sb.auth.admin.getUserById(id);
  console.log('admin email:', u.data.user?.email);
}

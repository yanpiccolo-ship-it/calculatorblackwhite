import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.SUPABASE_URL!, process.env.SERVICE_ROLE_KEY!, { auth: { persistSession: false }});
const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 50 });
if (error) { console.log('ERR:', error.message); process.exit(1); }
console.log('total users:', data.users.length);
data.users.forEach(u => console.log('-', u.email, '| created:', u.created_at?.slice(0,10), '| id:', u.id));

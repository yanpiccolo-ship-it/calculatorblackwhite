import { getSupabaseAdmin } from './supabaseAdmin';

// Validates that the incoming request was made by an authenticated admin.
// Reads the Authorization: Bearer <supabase access_token> header,
// verifies the user via Supabase Admin API, and confirms they have the
// 'admin' role in the user_roles table. Throws on failure.
export async function assertAdminFromRequest(req: {
  headers: Record<string, string | string[] | undefined>;
}): Promise<{ userId: string; email: string | null }> {
  const auth = req.headers['authorization'] || req.headers['Authorization' as any];
  const header = Array.isArray(auth) ? auth[0] : auth;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    throw new Error('Missing Authorization bearer token');
  }
  const token = header.slice(7).trim();
  if (!token) throw new Error('Empty bearer token');

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error('Invalid or expired session');
  }

  const { data: roleRow, error: roleErr } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .eq('role', 'admin')
    .maybeSingle();
  if (roleErr) throw new Error(`Role check failed: ${roleErr.message}`);
  if (!roleRow) throw new Error('Forbidden: admin role required');

  return { userId: data.user.id, email: data.user.email ?? null };
}

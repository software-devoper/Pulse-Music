import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export async function resolveEmailByUsername(req, res) {
  try {
    const username = req.query.username?.trim().toLowerCase();
    if (!username) return res.status(400).json({ error: 'Username is required' });

    // Primary path: resolve through profiles table.
    // This avoids dependency on Auth Admin listUsers for normal username login flow.
    const { data: profileMatch, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .or(`full_name.eq.${username},email.ilike.${username}@%`)
      .limit(1)
      .maybeSingle();

    if (!profileError && profileMatch?.email) {
      return res.json({ email: profileMatch.email });
    }

    let page = 1;
    const perPage = 200;

    while (true) {
      const {
        data: { users = [] } = {},
        error,
      } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

      if (error) {
        if (/valid Bearer token/i.test(error.message || '')) {
          return res.status(500).json({
            error: 'Server auth configuration issue. Please set SUPABASE_SERVICE_ROLE_KEY on backend.',
          });
        }
        throw error;
      }
      if (users.length === 0) break;

      const match = users.find((u) => {
        const metaUsername = (u.user_metadata?.username || '').toLowerCase();
        const emailLocal = (u.email || '').split('@')[0].toLowerCase();
        return metaUsername === username || emailLocal === username;
      });
      if (match?.email) {
        return res.json({ email: match.email });
      }

      if (users.length < perPage) break;
      page += 1;
    }

    return res.status(404).json({ error: 'Username not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not resolve username' });
  }
}

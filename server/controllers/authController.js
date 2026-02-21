import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export async function resolveEmailByUsername(req, res) {
  try {
    const username = req.query.username?.trim().toLowerCase();
    if (!username) return res.status(400).json({ error: 'Username is required' });

    let page = 1;
    const perPage = 200;

    while (true) {
      const {
        data: { users = [] } = {},
        error,
      } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

      if (error) throw error;
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

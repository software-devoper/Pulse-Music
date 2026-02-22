import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      const fallbackName = user?.user_metadata?.full_name || user?.user_metadata?.username || '';
      const fallbackAvatar = user?.user_metadata?.avatar_url || '';

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (!fetchError && data) {
        setUsername(data.username || user?.user_metadata?.username || '');
        setFullName(data.full_name || fallbackName);
        setAvatarUrl(data.avatar_url || fallbackAvatar);
      } else {
        setUsername(user?.user_metadata?.username || '');
        setFullName(fallbackName);
        setAvatarUrl(fallbackAvatar);
      }
    };

    loadProfile();
  }, [user]);

  const uploadAvatar = async (file) => {
    if (!file || !user?.id) return;
    setUploading(true);
    setError('');

    try {
      const bucket = import.meta.env.VITE_SUPABASE_AVATAR_BUCKET || 'avatars';
      const extension = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar.${extension}`;

      const { data: existingFiles } = await supabase.storage.from(bucket).list(user.id, { limit: 100 });
      if (existingFiles?.length) {
        const removeTargets = existingFiles.map((item) => `${user.id}/${item.name}`);
        await supabase.storage.from(bucket).remove(removeTargets);
      }

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error('Could not resolve avatar URL');

      setAvatarUrl(data.publicUrl);
      setNotice('Profile image uploaded. Click Save Profile to apply.');
    } catch (err) {
      setError(err.message || 'Avatar upload failed. Ensure avatars bucket exists and is public.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const trimmedName = fullName.trim();
      const trimmedAvatar = avatarUrl.trim();

      const { error: updateError } = await updateProfile({
        full_name: trimmedName,
        avatar_url: trimmedAvatar,
      });
      if (updateError) throw updateError;

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          username: username || user?.user_metadata?.username || user?.email?.split('@')[0] || null,
          email: user.email,
          full_name: trimmedName,
          avatar_url: trimmedAvatar,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (profileError) throw profileError;

      setNotice('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Profile" subtitle="Manage your name and avatar professionally">
      <section className="max-w-2xl rounded-2xl border border-white/10 bg-card/80 p-5">
        <div className="mb-5 flex items-center gap-4">
          <img
            src={avatarUrl || 'https://placehold.co/200x200/171925/f3f4f6?text=User'}
            alt="Profile"
            className="h-16 w-16 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-white">{fullName || 'Unnamed user'}</p>
            <p className="text-xs text-gray-400">@{username || 'username'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing ? (
            <>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wide text-gray-400">Display Name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-rose-400"
                />
              </label>

              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Profile Photo</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
                  <Upload size={14} />
                  {uploading ? 'Uploading...' : 'Upload from device'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => uploadAvatar(e.target.files?.[0])}
                  />
                </label>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm text-gray-300">Profile is up to date.</p>
            </div>
          )}

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                type="submit"
                disabled={saving || uploading}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-400 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setNotice('');
                }}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm text-gray-200 hover:bg-white/10"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </section>
    </AppLayout>
  );
}

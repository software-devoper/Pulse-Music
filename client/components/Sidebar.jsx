import { Download, Home, Library, ListMusic, LogOut, Menu, Radio, Search, UserCircle2 } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

const links = [
  { to: '/', label: 'Browse', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'Your Library', icon: Library },
  { to: '/downloads', label: 'Downloads', icon: Download },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
];

export default function Sidebar({ open, setOpen }) {
  const { signOut, user } = useAuth();
  const { clearPlayer } = usePlayer();

  const handleLogout = async () => {
    clearPlayer();
    await signOut();
  };

  return (
    <>
      <button
        className="fixed left-4 top-4 z-[70] rounded-lg bg-card p-2 text-white md:hidden"
        onClick={() => setOpen((v) => !v)}
      >
        <Menu size={18} />
      </button>
      <aside
        className={`fixed left-0 top-0 z-[65] flex h-full w-72 transform flex-col border-r border-white/10 bg-[#0f111d]/95 p-6 pb-36 backdrop-blur-xl transition md:translate-x-0 md:pb-6 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" className="mb-8 flex items-center gap-2 text-xl font-semibold text-white">
          <ListMusic className="text-rose-400" size={22} />
          Apple Music
        </Link>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="pt-4 text-xs uppercase tracking-wide text-gray-500">Radio</div>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5">
            <Radio size={16} />
            Radio
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5">
            <ListMusic size={16} />
            Create Playlist
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5">
            <Library size={16} />
            Categories
          </button>
        </nav>

        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="flex items-center gap-2">
            <img
              src={user?.user_metadata?.avatar_url || 'https://placehold.co/100x100/171925/f3f4f6?text=U'}
              alt="User avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="truncate text-[10px] text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md border border-white/20 px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
        >
          <LogOut size={12} /> Logout
        </button>
      </aside>

      {open && <div className="fixed inset-0 z-[60] bg-black/50 md:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}

import { Disc3, Eye, EyeOff, Headphones, Lock, LogIn, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/';
  const isSignup = mode === 'signup';

  const submitLabel = useMemo(() => {
    if (loading) return 'Please wait...';
    return isSignup ? 'Create account' : 'Log in';
  }, [loading, isSignup]);

  const resolveLoginEmail = async (usernameInput) => {
    const normalized = usernameInput.trim().toLowerCase();
    if (normalized.includes('@')) return normalized;
    const { data } = await api.get('/auth/email-by-username', { params: { username: normalized } });
    return data?.email;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const normalizedUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!normalizedUsername) {
      setError('Username is required.');
      return;
    }

    if (isSignup) {
      if (!email.trim()) {
        setError('Email is required.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignup) {
        const signupEmail = email.trim().toLowerCase();
        const { data, error: signUpError } = await signUp(signupEmail, password, {
          username: normalizedUsername,
          full_name: normalizedUsername,
          contact_email: signupEmail,
        });
        if (signUpError) throw signUpError;

        if (!data?.session) {
          setNotice('Pulse Music Studio: account created. Check your email to verify your account, then log in.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
          return;
        }
      } else {
        const emailForAuth = await resolveLoginEmail(normalizedUsername);
        if (!emailForAuth) throw new Error('Username not found');
        const { error: signInError } = await signIn(emailForAuth, password);
        if (signInError) throw signInError;
      }

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute left-[-120px] top-[-100px] h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-180px] right-[-120px] h-[28rem] w-[28rem] rounded-full bg-rose-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.15),transparent_28%),radial-gradient(circle_at_10%_80%,rgba(217,70,239,0.14),transparent_30%)]" />

      <div className="relative grid w-full max-w-6xl animate-fadeInUp overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f1f]/85 shadow-glow backdrop-blur-xl lg:grid-cols-[1.1fr_1fr]">
        <section className="hidden border-r border-white/10 p-10 lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs tracking-[0.18em] text-rose-200">
            <Disc3 size={14} />
            PULSE MUSIC
          </div>
          <h2 className="max-w-md text-4xl font-semibold leading-tight text-white">
            {isSignup ? 'Create your account and start listening.' : 'Pick up right where your music paused.'}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">
            Stream, save, and organize tracks in one clean dashboard built for continuous listening.
          </p>
          <div className="mt-10 grid gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
              <Headphones size={16} className="text-rose-300" />
              High-quality streaming and smooth playback.
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
              <ShieldCheck size={16} className="text-rose-300" />
              Secure account and private playlist storage.
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <p className="mb-1 text-xs uppercase tracking-[0.22em] text-rose-300 lg:hidden">Pulse Music</p>
          <h1 className="text-3xl font-bold text-white">{isSignup ? 'Create account' : 'Welcome back'}</h1>
          <p className="mt-2 text-sm text-gray-400">
            {isSignup ? 'Sign up with username, email and password.' : 'Login with username and password.'}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setNotice('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                !isSignup ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <LogIn size={14} />
                Log in
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setNotice('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                isSignup ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <UserPlus size={14} />
                Sign up
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 transition-all duration-300">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-400">Username</span>
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#0f1528] px-3 focus-within:border-rose-300">
                <User size={16} className="text-gray-400" />
                <input
                  required
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
            </label>

            {isSignup ? (
              <label className="block animate-fadeInUp">
                <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-400">Email</span>
                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#0f1528] px-3 focus-within:border-rose-300">
                  <Mail size={16} className="text-gray-400" />
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-400">Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#0f1528] px-3 focus-within:border-rose-300">
                <Lock size={16} className="text-gray-400" />
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-500"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {isSignup ? (
              <label className="block animate-fadeInUp">
                <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-400">Confirm Password</span>
                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#0f1528] px-3 focus-within:border-rose-300">
                  <Lock size={16} className="text-gray-400" />
                  <input
                    required
                    minLength={6}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
            ) : null}

            {notice ? (
              <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{notice}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

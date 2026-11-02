import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { useAuth } from '../../context/AuthContext.js';
import { useSocket } from '../../context/SocketContext.js';
import { authApi } from '../../services/api.js';
import { Dices, Shield, Lock, User, Mail, Sparkles, KeyRound } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    login,
    register,
  } = useAuth();
  const { showToast } = useSocket();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate anonymous username on register tab open
  const fetchNewUsername = async () => {
    setIsGenerating(true);
    try {
      const data = await authApi.generateUsername();
      if (data.success) {
        setRegUsername(data.username);
      }
    } catch {
      // Fallback local generator if offline
      const adj = ['Silent', 'Quiet', 'Hope', 'Gentle', 'Calm', 'Moon'];
      const nouns = ['Soul', 'Seeker', 'Walker', 'Heart', 'Echo'];
      const num = Math.floor(10 + Math.random() * 900);
      setRegUsername(`${adj[Math.floor(Math.random() * adj.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}_${num}`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isAuthModalOpen && authModalTab === 'register' && !regUsername) {
      fetchNewUsername();
    }
  }, [isAuthModalOpen, authModalTab]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      showToast('Missing Fields', 'Please enter your username and password.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(loginIdentifier, loginPassword);
      showToast('Welcome Back', 'You are securely signed in.', 'success');
    } catch (err: any) {
      showToast('Login Failed', err.response?.data?.message || 'Invalid credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPassword || regPassword.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        anonymousUsername: regUsername,
        nickname: regNickname,
        email: regEmail,
        password: regPassword,
      });
      showToast('Anonymous Sanctuary Ready', 'Your anonymous profile is created. Welcome to True Companion.', 'success');
    } catch (err: any) {
      showToast('Registration Error', err.response?.data?.message || 'Could not complete registration.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper to fill demo accounts for testing
  const fillDemoAccount = (username: string) => {
    setLoginIdentifier(username);
    setLoginPassword('Companion@2026!');
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="md"
      title={authModalTab === 'login' ? 'Welcome Back' : 'Create Anonymous Account'}
    >
      <div>
        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 dark:border-companion-dark-border mb-5">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className={`flex-1 pb-3 text-xs font-semibold text-center transition-colors border-b-2 ${
              authModalTab === 'login'
                ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className={`flex-1 pb-3 text-xs font-semibold text-center transition-colors border-b-2 ${
              authModalTab === 'register'
                ? 'border-companion-lavender-500 text-companion-lavender-600 dark:text-companion-lavender-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Anonymous Register
          </button>
        </div>

        {/* ---------------- LOGIN FORM ---------------- */}
        {authModalTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Anonymous Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. SilentSoul_482 or email"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 rounded-xl transition-all shadow-sm hover:shadow-soft-hover disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In Safely'}
            </button>

            {/* Demo Quick Fill helper */}
            <div className="pt-3 border-t border-zinc-100 dark:border-companion-dark-border text-center">
              <p className="text-[11px] text-zinc-400 mb-2">Quick 1-Click Demo Logins:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('SilentSoul_482')}
                  className="px-2.5 py-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
                >
                  SilentSoul_482 (User)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('HopeSeeker_91')}
                  className="px-2.5 py-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
                >
                  HopeSeeker_91 (User)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('QuietGuardian_01')}
                  className="px-2.5 py-1 text-[11px] bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 rounded-lg text-amber-800 dark:text-amber-300 font-mono border border-amber-200 dark:border-amber-900/50 transition-colors"
                >
                  QuietGuardian_01 (Admin)
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ---------------- REGISTER FORM ---------------- */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="p-3 bg-companion-lavender-50 dark:bg-companion-lavender-950/30 border border-companion-lavender-200 dark:border-companion-lavender-900/40 rounded-xl flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-companion-lavender-500 shrink-0 mt-0.5" />
              <p className="text-xs text-companion-charcoal dark:text-zinc-300 leading-relaxed">
                No real names. You will be known exclusively by your anonymous handle.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Generated Anonymous Handle
                </label>
                <button
                  type="button"
                  onClick={fetchNewUsername}
                  disabled={isGenerating}
                  className="text-xs text-companion-lavender-600 dark:text-companion-lavender-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <Dices className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate New
                </button>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. HopeSeeker_91"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Friendly Nickname (Optional)
              </label>
              <input
                type="text"
                value={regNickname}
                onChange={(e) => setRegNickname(e.target.value)}
                placeholder="e.g. Quiet Listener or Gentle Morning"
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Recovery Email (Optional & Strictly Private)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Only used for password recovery, never shown"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-companion-lavender-400 text-zinc-800 dark:text-zinc-200"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 rounded-xl transition-all shadow-sm hover:shadow-soft-hover disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Creating Sanctuary...' : 'Join True Companion'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

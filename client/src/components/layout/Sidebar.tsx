import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useSocket } from '../../context/SocketContext.js';
import {
  Home,
  Compass,
  PlusCircle,
  FileText,
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
  User,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { unreadNotificationCount } = useSocket();

  const navItems = [
    { label: 'Home Feed', path: '/dashboard', icon: Home },
    { label: 'Explore Stories', path: '/explore', icon: Compass },
    { label: 'Create a Post', path: '/create', icon: PlusCircle, highlight: true },
    { label: 'My Posts', path: '/my-posts', icon: FileText, authRequired: true },
    { label: 'Chat Requests', path: '/requests', icon: HeartHandshake, authRequired: true },
    { label: 'Messages', path: '/messages', icon: MessageSquare, authRequired: true },
    { label: 'Safety Center', path: '/safety', icon: ShieldCheck },
    { label: 'Profile & Settings', path: '/profile', icon: User, authRequired: true },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 p-4 border-r border-zinc-200/80 dark:border-companion-dark-border min-h-[calc(100vh-4rem)] bg-white/50 dark:bg-companion-dark-surface/50 backdrop-blur-sm transition-colors">
      <div className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          if (item.authRequired && !isAuthenticated) {
            return (
              <button
                key={item.label}
                onClick={() => openAuthModal('login')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-companion-dark-card transition-all text-left"
              >
                <item.icon className="w-4 h-4 text-zinc-400" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-companion-lavender-100 text-companion-lavender-700 dark:bg-companion-lavender-950/60 dark:text-companion-lavender-300 font-semibold'
                    : item.highlight
                    ? 'text-companion-lavender-600 dark:text-companion-lavender-300 hover:bg-companion-lavender-50 dark:hover:bg-companion-lavender-950/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-companion-dark-card hover:text-zinc-900 dark:hover:text-zinc-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-4 h-4 ${
                    item.highlight ? 'text-companion-lavender-500' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}

        {/* Admin Link */}
        {isAuthenticated && user?.role === 'admin' && (
          <div className="pt-3 mt-3 border-t border-zinc-200/80 dark:border-companion-dark-border">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 font-semibold'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                }`
              }
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Admin Moderation</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Comforting Mission Box */}
      <div className="mt-auto pt-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-companion-lavender-50 to-companion-blue-50 dark:from-companion-lavender-950/40 dark:to-companion-dark-card border border-companion-lavender-100 dark:border-companion-dark-border text-center">
          <Sparkles className="w-4 h-4 text-companion-lavender-400 mx-auto mb-1.5" />
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
            "Sometimes, all we need is someone who listens."
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
            Safe • Anonymous • Empathetic
          </p>
        </div>
      </div>
    </aside>
  );
};

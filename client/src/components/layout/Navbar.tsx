import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useSocket } from '../../context/SocketContext.js';
import { Avatar } from '../common/Avatar.js';
import {
  HeartHandshake,
  Bell,
  Sun,
  Moon,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  CheckCheck,
  ExternalLink,
  ChevronDown,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useSocket();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick exit feature for user privacy & safety
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-companion-dark-surface/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-companion-dark-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-companion-lavender-400 to-companion-blue-300 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
              True Companion
            </span>
            <span className="hidden sm:block text-[10px] text-zinc-400 dark:text-zinc-500 font-normal leading-none -mt-0.5">
              Someone is here to listen
            </span>
          </div>
        </Link>

        {/* Action Controls & Emergency Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Emergency Crisis Quick Button */}
          <Link
            to="/safety"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 transition-colors"
            title="Helplines: India 112 / Tele-MANAS 14416"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Crisis Support (14416)</span>
          </Link>

          {/* Quick Exit Button (Privacy Protection) */}
          <button
            onClick={handleQuickExit}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 px-2 py-1 rounded border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Quickly leave this site to Google"
          >
            Quick Exit
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-companion-dark-card transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Notifications Dropdown (If authenticated) */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-companion-dark-card transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-companion-lavender-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-companion-dark-surface rounded-2xl shadow-xl border border-zinc-200 dark:border-companion-dark-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-companion-dark-border">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      Notifications
                    </span>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-companion-lavender-500 hover:text-companion-lavender-600 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-companion-dark-border">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-zinc-400">
                        No notifications yet. You will be alerted when someone accepts a chat or messages you.
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.isRead) markNotificationRead(n._id);
                            if (n.link) {
                              setShowNotifications(false);
                              navigate(n.link);
                            }
                          }}
                          className={`px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-companion-dark-card transition-colors flex items-start gap-3 ${
                            !n.isRead
                              ? 'bg-companion-lavender-50/50 dark:bg-companion-lavender-950/20'
                              : ''
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-companion-lavender-500" style={{ opacity: n.isRead ? 0 : 1 }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {n.title}
                            </p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-zinc-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-zinc-100 dark:border-companion-dark-border text-center">
                    <Link
                      to="/requests"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-medium text-companion-lavender-600 dark:text-companion-lavender-400 hover:underline"
                    >
                      View Chat Requests →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth Action */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-companion-dark-card transition-colors border border-zinc-200 dark:border-companion-dark-border"
              >
                <Avatar avatarId={user.avatar} size="sm" />
                <span className="hidden sm:inline-block text-xs font-medium text-zinc-700 dark:text-zinc-200 max-w-[120px] truncate">
                  {user.nickname || user.anonymousUsername}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-companion-dark-surface rounded-2xl shadow-xl border border-zinc-200 dark:border-companion-dark-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-companion-dark-border">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                      {user.nickname || user.anonymousUsername}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 truncate">
                      @{user.anonymousUsername}
                    </p>
                    {user.role === 'admin' && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Admin Moderator
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-companion-dark-card"
                    >
                      <UserIcon className="w-4 h-4 text-zinc-400" />
                      Anonymous Profile
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-zinc-100 dark:hover:bg-companion-dark-card"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Moderation
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-zinc-100 dark:border-companion-dark-border">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 rounded-xl transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-soft-hover transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join Anonymously</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

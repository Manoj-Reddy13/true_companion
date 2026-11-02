import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  Home,
  Compass,
  PlusCircle,
  HeartHandshake,
  MessageSquare,
  User,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Post', path: '/create', icon: PlusCircle, isMain: true },
    { label: 'Requests', path: '/requests', icon: HeartHandshake, authRequired: true },
    { label: 'Chat', path: '/messages', icon: MessageSquare, authRequired: true },
    { label: 'Profile', path: '/profile', icon: User, authRequired: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-companion-dark-surface/95 backdrop-blur-md border-t border-zinc-200 dark:border-companion-dark-border px-2 py-1 flex items-center justify-around">
      {navItems.map((item) => {
        if (item.authRequired && !isAuthenticated) {
          return (
            <button
              key={item.label}
              onClick={() => openAuthModal('login')}
              className="flex flex-col items-center justify-center p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 transition-colors ${
                item.isMain
                  ? 'text-companion-lavender-500 hover:scale-105'
                  : isActive
                  ? 'text-companion-lavender-600 dark:text-companion-lavender-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`
            }
          >
            {item.isMain ? (
              <div className="w-10 h-10 -mt-5 rounded-full bg-companion-lavender-500 text-white flex items-center justify-center shadow-md">
                <item.icon className="w-5 h-5" />
              </div>
            ) : (
              <item.icon className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

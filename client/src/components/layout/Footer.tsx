import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Shield, Phone, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-companion-dark-surface border-t border-zinc-200/80 dark:border-companion-dark-border mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-companion-lavender-400 to-companion-blue-300 flex items-center justify-center text-white shadow-sm">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                True Companion
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
              A peaceful, anonymous peer-support sanctuary designed for people experiencing loneliness, emotional struggles, academic stress, or career confusion. No likes, no followers, no judgment.
            </p>
            <p className="text-xs italic text-companion-lavender-600 dark:text-companion-lavender-400 font-medium">
              "Sometimes, all we need is someone who listens."
            </p>
          </div>

          {/* Crisis Helplines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-500" />
              Emergency Crisis Help
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">India:</span> Tele-MANAS{' '}
                <a href="tel:14416" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  14416
                </a>{' '}
                (24/7 Toll-Free)
              </li>
              <li>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">India Emergency:</span>{' '}
                <a href="tel:112" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  112
                </a>
              </li>
              <li>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">US & Canada:</span>{' '}
                <a href="tel:988" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  988
                </a>
              </li>
              <li>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">UK Crisis:</span>{' '}
                <a href="tel:111" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  111
                </a>{' '}
                / Samaritans 116 123
              </li>
            </ul>
          </div>

          {/* Quick Links & Safety */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-companion-lavender-500" />
              Guidelines & Safety
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link to="/safety" className="hover:text-companion-lavender-600 transition-colors">
                  Safety Center & Guidelines
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-companion-lavender-600 transition-colors">
                  Explore Shared Stories
                </Link>
              </li>
              <li>
                <Link to="/safety#policy" className="hover:text-companion-lavender-600 transition-colors">
                  Anti-Harassment Policy
                </Link>
              </li>
              <li>
                <Link to="/safety#privacy" className="hover:text-companion-lavender-600 transition-colors">
                  Anonymous Privacy Promise
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-companion-dark-border text-center">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-3xl mx-auto">
            <strong>Important Notice:</strong> True Companion is a peer-to-peer emotional support platform and does not provide clinical diagnosis, psychiatric therapy, or emergency crisis intervention. If you or someone you know is in imminent danger of self-harm or medical emergency, please reach out immediately to emergency services or call national crisis hotlines.
          </p>
          <div className="mt-4 text-xs text-zinc-400 flex flex-wrap items-center justify-center gap-4">
            <span>© {new Date().getFullYear()} True Companion. Made with compassion.</span>
            <span>•</span>
            <Link to="/safety" className="hover:underline">
              Community Guidelines
            </Link>
            <span>•</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Anonymous & Secure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

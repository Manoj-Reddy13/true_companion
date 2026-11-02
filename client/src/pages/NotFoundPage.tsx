import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-companion-lavender-100 dark:bg-companion-lavender-950/60 text-companion-lavender-600 dark:text-companion-lavender-300 flex items-center justify-center shadow-soft">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>

      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
        You've Wandered a Bit Off Path
      </h1>

      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
        Sometimes life takes unexpected turns, and that is completely okay. Let's guide you back to our comforting sanctuary.
      </p>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

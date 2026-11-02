import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  HeartHandshake,
  Shield,
  MessageSquare,
  Lock,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Smile,
  Users,
  Compass,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  const handleShareStory = () => {
    if (isAuthenticated) {
      navigate('/create');
    } else {
      openAuthModal('register');
    }
  };

  const faqs = [
    {
      q: 'Is True Companion truly anonymous?',
      a: 'Yes. You are identified only by a generated anonymous handle (such as SilentSoul_482) and an optional chosen nickname. Your email is optional, strictly private, and never revealed to any other user.',
    },
    {
      q: 'How does True Companion differ from traditional social media?',
      a: 'We have deliberately eliminated likes, follower counters, public rankings, and algorithmic feeds designed to induce addiction or comparison. Our platform focuses entirely on 1-on-1 human empathy and listening.',
    },
    {
      q: 'Can anyone send me unsolicited private messages?',
      a: 'No. To protect your peace, private chats require a mutual consent workflow. Someone must send a Chat Request with an introductory message, and a conversation begins only if you choose to accept it.',
    },
    {
      q: 'Is this a substitute for professional mental healthcare?',
      a: 'No. True Companion is a peer-to-peer emotional support community. Our members are compassionate listeners, not licensed therapists. For clinical depression, psychiatric diagnosis, or crisis emergencies, we provide direct hotlines to professional emergency services.',
    },
    {
      q: 'What should I do if someone violates community guidelines?',
      a: 'Every post, message, and profile has a 1-click Report button. Our moderation team reviews reports promptly and takes decisive action, including issuing warnings, removing harmful posts, and permanently banning toxic accounts.',
    },
  ];

  return (
    <div className="space-y-24 pb-16">
      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Soft background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-companion-lavender-200/40 to-companion-blue-200/30 dark:from-companion-lavender-900/20 dark:to-companion-blue-900/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-companion-lavender-700 bg-companion-lavender-100/80 dark:text-companion-lavender-300 dark:bg-companion-lavender-950/60 border border-companion-lavender-200/60 dark:border-companion-lavender-800/40 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-companion-lavender-500" />
            <span>Anonymous Emotional Support & Peer Connection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl mx-auto leading-tight sm:leading-tight">
            You Don't Have to Go Through Everything{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-companion-lavender-500 to-companion-blue-400">
              Alone.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            A safe and anonymous space to share what you're going through, find people who understand, and discover the comfort of being heard.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold text-white bg-companion-lavender-500 hover:bg-companion-lavender-600 shadow-md hover:shadow-soft-hover transition-all duration-200"
            >
              <span>Find Your Companion</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleShareStory}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-companion-dark-surface hover:bg-zinc-50 dark:hover:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border shadow-sm transition-all duration-200"
            >
              <HeartHandshake className="w-4 h-4 text-companion-lavender-500" />
              <span>Share Your Story</span>
            </button>
          </div>

          {/* Calming illustration banner */}
          <div className="mt-14 max-w-3xl mx-auto p-4 sm:p-6 bg-white/70 dark:bg-companion-dark-surface/70 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-companion-dark-border shadow-soft">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-companion-bg dark:bg-companion-dark-card">
                <div className="w-9 h-9 rounded-xl bg-companion-lavender-100 dark:bg-companion-lavender-900/40 text-companion-lavender-600 dark:text-companion-lavender-300 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">100% Anonymous</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">No real names, phone numbers, or social handles.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-companion-bg dark:bg-companion-dark-card">
                <div className="w-9 h-9 rounded-xl bg-companion-blue-100 dark:bg-companion-blue-900/40 text-companion-blue-600 dark:text-companion-blue-300 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Consent-Driven</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Direct chat requires mutual request approval.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-companion-bg dark:bg-companion-dark-card">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Zero Vanity Metrics</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">No like counts or followers. Only genuine empathy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-companion-lavender-600 dark:text-companion-lavender-400">
            Simple & Empathetic
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            How True Companion Works
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Three respectful steps designed to keep you emotionally safe and comfortably heard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-companion-lavender-100 dark:bg-companion-lavender-950/60 text-companion-lavender-600 dark:text-companion-lavender-300 flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Share Anonymously
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Write openly about what is weighing on your mind—loneliness, career pressure, academic stress, or family difficulties. Your identity is automatically shielded.
              </p>
            </div>
            <span className="text-[11px] font-medium text-companion-lavender-500 mt-4 block">
              Safe expression →
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-companion-blue-100 dark:bg-companion-blue-950/60 text-companion-blue-600 dark:text-companion-blue-300 flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Request to Chat
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When a story resonates with you or you want someone to talk to, send a private Chat Request with a gentle introductory note. No cold messages.
              </p>
            </div>
            <span className="text-[11px] font-medium text-companion-blue-500 mt-4 block">
              Mutual consent →
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Connect in Private
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Once accepted, communicate in real-time in a distraction-free, 1-on-1 private messaging room. You can end the conversation at any moment peacefully.
              </p>
            </div>
            <span className="text-[11px] font-medium text-emerald-500 mt-4 block">
              Peace of mind →
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES HIGHLIGHT ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-companion-lavender-50/60 via-white to-companion-blue-50/50 dark:from-companion-lavender-950/20 dark:via-companion-dark-surface dark:to-companion-blue-950/20 border border-zinc-200/80 dark:border-companion-dark-border">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Connect With People Who Truly Understand
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5">
              Whatever you are carrying today, someone in our community has walked a similar path.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
            {[
              'Mental Wellbeing',
              'Loneliness',
              'Relationship Issues',
              'Academic Pressure',
              'Career Confusion',
              'Family Problems',
              'Personal Struggles',
              'Motivation',
              'Other',
            ].map((cat) => (
              <Link
                key={cat}
                to={`/explore?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2 rounded-2xl text-xs font-medium bg-white dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border text-zinc-700 dark:text-zinc-200 hover:border-companion-lavender-400 hover:text-companion-lavender-600 dark:hover:text-companion-lavender-300 transition-colors shadow-sm"
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-xs font-semibold text-companion-lavender-600 dark:text-companion-lavender-400 hover:underline"
            >
              Browse All Stories on the Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- GUIDELINES & SAFE SPACE ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
              Zero Tolerance For Toxicity
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
              A Safe Space Founded on Mutual Care
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
              We protect our community rigorously. True Companion is designed to be a tranquil harbor, free from harassment, judgment, and trolling.
            </p>

            <ul className="mt-6 space-y-3.5">
              {[
                'Every conversation can be ended instantly by either participant.',
                '1-click block button immediately terminates communication and removes mutual visibility.',
                'Reports are reviewed confidentially by our active moderation team.',
                'Strict protection against hate speech, bullying, solicitation, and scams.',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-companion-lavender-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                to="/safety"
                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-companion-dark-card dark:hover:bg-zinc-800 px-4 py-2 rounded-xl transition-colors"
              >
                <Shield className="w-4 h-4 text-companion-lavender-500" />
                Read Full Community Guidelines & Policies
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 text-white dark:bg-companion-dark-card border border-zinc-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <PhoneCall className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Emergency Crisis Guidance</h3>
                <p className="text-[11px] text-zinc-400">If you or someone else is in immediate crisis</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              True Companion is a peer-support platform, not a replacement for professional mental healthcare or emergency medical intervention.
            </p>

            <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">India 24/7 Mental Health (Tele-MANAS)</span>
                <a href="tel:14416" className="font-bold text-rose-400 hover:underline">
                  14416
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">India National Emergency</span>
                <a href="tel:112" className="font-bold text-rose-400 hover:underline">
                  112
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">US & Canada Suicide & Crisis Lifeline</span>
                <a href="tel:988" className="font-bold text-rose-400 hover:underline">
                  988
                </a>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 italic">
              "You matter, your life has profound dignity, and asking for help is a sign of courage."
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- FREQUENTLY ASKED QUESTIONS ---------------- */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-companion-lavender-600 dark:text-companion-lavender-400">
            Clarity & Transparency
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-zinc-200 dark:border-companion-dark-border rounded-2xl bg-white dark:bg-companion-dark-surface overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-companion-lavender-600 dark:hover:text-companion-lavender-400"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    openFaqIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaqIndex === i && (
                <div className="px-5 pb-5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-companion-dark-border/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FINAL CTA BANNER ---------------- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-companion-lavender-500 to-companion-blue-400 text-white p-8 sm:p-14 text-center shadow-soft relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Ready to Be Heard Without Judgment?
            </h2>
            <p className="text-xs sm:text-sm text-companion-lavender-50 leading-relaxed">
              Join thousands of thoughtful individuals discovering the quiet comfort of being understood. Create your anonymous account in 10 seconds.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => (isAuthenticated ? navigate('/dashboard') : openAuthModal('register'))}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-companion-lavender-900 bg-white hover:bg-zinc-100 transition-all shadow-md"
              >
                {isAuthenticated ? 'Go to My Dashboard' : 'Find Someone Who Listens'}
              </button>
              <Link
                to="/safety"
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-companion-lavender-600/60 hover:bg-companion-lavender-600 border border-white/30 transition-all"
              >
                Explore Safety Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

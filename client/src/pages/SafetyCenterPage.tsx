import React from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Lock,
  HeartHandshake,
  AlertTriangle,
  UserX,
  FileCheck,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';

export const SafetyCenterPage: React.FC = () => {
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Top Banner with Quick Exit */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-companion-lavender-50 dark:from-rose-950/20 dark:via-companion-dark-surface dark:to-companion-dark-card border border-rose-200/80 dark:border-rose-900/40 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <LifeBuoy className="w-4 h-4 text-rose-500 animate-pulse" />
            Safety & Crisis Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
            Your Emotional & Physical Safety Comes First
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1 max-w-xl leading-relaxed">
            True Companion is built as a respectful peer-support harbor. Please review our safety boundaries, guidelines, and emergency resources.
          </p>
        </div>

        <button
          onClick={handleQuickExit}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 shadow-sm transition-all shrink-0"
          title="Immediately leave this site and open Google"
        >
          Quick Exit (Esc)
        </button>
      </div>

      {/* ---------------- 1. EMERGENCY CRISIS DIRECTORY ---------------- */}
      <section className="p-6 sm:p-8 rounded-3xl bg-rose-500 text-white shadow-soft space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              Immediate Crisis Helplines
            </h2>
            <p className="text-xs text-rose-100">
              Free, confidential support available 24 hours a day, 7 days a week.
            </p>
          </div>
        </div>

        <p className="text-xs text-rose-100 leading-relaxed max-w-2xl">
          If you or someone you are speaking with is expressing active thoughts of suicide, severe self-harm, or is in immediate danger, please do not rely solely on peer messaging. Contact emergency services right away:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* India Resources */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
              India Resources
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span>Tele-MANAS (Govt of India 24/7)</span>
                <a href="tel:14416" className="font-extrabold text-white text-sm hover:underline">
                  14416
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>National Emergency Services</span>
                <a href="tel:112" className="font-extrabold text-white text-sm hover:underline">
                  112
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Vandrevala Foundation Helpline</span>
                <a href="tel:+919999666555" className="font-bold text-white hover:underline">
                  9999 666 555
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>KIRAN Mental Health Toll-Free</span>
                <a href="tel:18005990019" className="font-bold text-white hover:underline">
                  1800-599-0019
                </a>
              </div>
            </div>
          </div>

          {/* International Resources */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
              International Resources
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span>United States & Canada Lifeline</span>
                <a href="tel:988" className="font-extrabold text-white text-sm hover:underline">
                  988
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>United Kingdom (NHS / Samaritans)</span>
                <a href="tel:111" className="font-extrabold text-white text-sm hover:underline">
                  111 / 116 123
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Australia (Lifeline)</span>
                <a href="tel:131114" className="font-bold text-white hover:underline">
                  13 11 14
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Befrienders Worldwide Directory</span>
                <a
                  href="https://www.befrienders.org"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-white hover:underline inline-flex items-center gap-1"
                >
                  befrienders.org <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 2. PEER SUPPORT DISCLAIMER ---------------- */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft space-y-4">
        <div className="flex items-center gap-3">
          <HeartHandshake className="w-6 h-6 text-companion-lavender-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Peer Support vs. Professional Therapy
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            <strong>True Companion is not a clinic or medical provider.</strong> The individuals you converse with on this platform are empathetic fellow community members who have volunteered their time to listen. They are not licensed psychologists, psychiatrists, or medical professionals.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>We do not provide clinical psychiatric diagnosis or medication recommendations.</li>
            <li>We encourage you not to become emotionally dependent on any single peer companion.</li>
            <li>We recommend consulting qualified professionals for clinical depression, chronic anxiety, PTSD, or bipolar disorder.</li>
          </ul>
        </div>
      </section>

      {/* ---------------- 3. SAFE SHARING GUIDELINES ---------------- */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft space-y-4">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-companion-blue-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Protecting Your Personal Privacy
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          While we shield your identity behind anonymous handles, true privacy also depends on what you choose to write.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1.5">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
              Never Share:
            </span>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1 list-disc pl-4">
              <li>Real full names or residential addresses</li>
              <li>Phone numbers or personal email addresses</li>
              <li>Social media handles (Instagram, Snapchat, WhatsApp)</li>
              <li>Banking, UPI, credit card, or payment details</li>
              <li>Passcodes or account verification codes</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Safe to Share:
            </span>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1 list-disc pl-4">
              <li>Emotional experiences and personal feelings</li>
              <li>General challenges (exam anxiety, workplace stress)</li>
              <li>Reflections on healing, art, literature, or music</li>
              <li>Words of kindness, empathy, and listening ears</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- 4. HARASSMENT, REPORTING & BLOCKING ---------------- */}
      <section
        id="policy"
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-companion-dark-surface border border-zinc-200/80 dark:border-companion-dark-border shadow-soft space-y-4"
      >
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Anti-Harassment & Moderation Enforcement
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          True Companion strictly enforces a compassionate community standard. The following behaviors will result in immediate suspension or permanent banning:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border">
            <strong className="block text-zinc-800 dark:text-zinc-200 mb-1">Bullying & Harassment</strong>
            <p className="text-zinc-500">Insults, degrading language, threats, or repeated unwanted messaging.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border">
            <strong className="block text-zinc-800 dark:text-zinc-200 mb-1">Commercial Solicitation</strong>
            <p className="text-zinc-500">Promoting products, paid services, crypto schemes, or asking for money.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-companion-dark-card border border-zinc-200 dark:border-companion-dark-border">
            <strong className="block text-zinc-800 dark:text-zinc-200 mb-1">Inappropriate Imagery</strong>
            <p className="text-zinc-500">Sharing explicit, graphic, or non-consensual media of any kind.</p>
          </div>
        </div>

        <div className="pt-2 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
          <p>
            <strong>How to report:</strong> Click the flag / report button on any post or message. Our moderation team reviews reports and takes disciplinary actions within hours.
          </p>
          <p>
            <strong>How to block:</strong> Click the block icon in any chat header to immediately terminate the conversation and hide your account from that user.
          </p>
        </div>
      </section>
    </div>
  );
};

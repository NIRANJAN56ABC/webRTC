import { useEffect } from 'react';
import { useChat } from '../context/ChatContext.tsx';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Fully Anonymous',
    desc: 'No account, no email, no trace. Completely anonymous.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Instant Match',
    desc: 'Click start and you are connected to a random person in seconds.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
      </svg>
    ),
    title: 'HD Video & Audio',
    desc: 'Crystal clear peer-to-peer video powered by WebRTC.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: 'Live Text Chat',
    desc: 'Send messages alongside your video call in real time.',
  },
];

const steps = [
  { num: '01', text: 'Click Start' },
  { num: '02', text: 'Get matched instantly' },
  { num: '03', text: 'Chat, skip, repeat' },
];

export function LandingPage() {
  const { start } = useChat();

  // Allow scrolling on landing page
  useEffect(() => {
    document.body.classList.add('landing');
    return () => document.body.classList.remove('landing');
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-5 md:px-12 py-4 border-b border-white/6 sticky top-0 bg-black/90 backdrop-blur-sm z-50">
        <span className="font-display font-bold text-base md:text-lg tracking-tight">
          meet<span className="text-white/25">.</span>
        </span>
        <button
          onClick={start}
          className="text-sm font-medium text-white/70 hover:text-white transition-colors py-2 px-1"
        >
          Launch app →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-5 pt-16 pb-16 md:pt-28 md:pb-24">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3.5 py-1.5 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs text-white/50 tracking-wide font-medium">Free · No sign-up required</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] max-w-4xl mb-5">
          Meet someone interesting.
          <br />
          <span className="text-white/40">Right now.</span>
        </h1>

        {/* Sub */}
        <p className="text-white/60 text-sm sm:text-base md:text-lg max-w-sm md:max-w-md leading-relaxed mb-8">
          Anonymous one-on-one video chat. No accounts, no history.
          Just you and whoever's on the other side.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={start}
            className="flex items-center gap-2.5 bg-white text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-white/90 active:scale-95 transition-all duration-150 min-w-[160px] justify-center"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 2.5a.5.5 0 01.765-.424l10 5.5a.5.5 0 010 .848l-10 5.5A.5.5 0 013 13.5v-11z" />
            </svg>
            Start finding
          </button>
          <span className="text-xs text-white/25">No camera? Text-only works too.</span>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-5 md:px-12 py-12 md:py-16 border-t border-white/6">
        <p className="text-xs text-white/50 tracking-widest uppercase mb-8 md:mb-10 text-center font-medium">How it works</p>
        <div className="flex flex-col sm:flex-row items-center justify-center max-w-2xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.num} className="flex flex-col sm:flex-row items-center flex-1 w-full sm:w-auto">
              <div className="flex flex-col items-center text-center px-4 py-3 md:px-6 md:py-4">
                <span className="font-display text-3xl md:text-4xl font-bold text-white/15 mb-1.5">{step.num}</span>
                <span className="text-sm text-white/80 font-medium">{step.text}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-px h-6 sm:h-px sm:w-8 bg-white/8 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-5 md:px-12 py-12 md:py-16 border-t border-white/6">
        <p className="text-xs text-white/50 tracking-widest uppercase mb-8 md:mb-10 text-center font-medium">Features</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/3 border border-white/6 rounded-2xl p-4 md:p-5 hover:bg-white/5 hover:border-white/10 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 mb-3 md:mb-4">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-sm text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-white/55 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 md:px-12 py-16 md:py-24 border-t border-white/6 flex flex-col items-center text-center">
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-5xl tracking-tight mb-4">
          Ready to meet someone interesting?
        </h2>
        <p className="text-white/50 text-sm mb-7 max-w-xs">
          One click. Completely anonymous. Skip anytime.
        </p>
        <button
          onClick={start}
          className="flex items-center gap-2.5 bg-white text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-white/90 active:scale-95 transition-all duration-150"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 2.5a.5.5 0 01.765-.424l10 5.5a.5.5 0 010 .848l-10 5.5A.5.5 0 013 13.5v-11z" />
          </svg>
          Start finding
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 md:px-12 py-5 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-display font-bold text-sm text-white/20 tracking-tight">
          meet<span className="text-white/10">.</span>
        </span>
        <p className="text-xs text-white/25">
          Built with WebRTC · Be kind to each other.
        </p>
      </footer>

    </div>
  );
}

import { useState } from 'react';
import { VideoPanel } from '../components/VideoPanel.tsx';
import { ChatPanel } from '../components/ChatPanel.tsx';
import { Controls } from '../components/Controls.tsx';
import { useChat } from '../context/ChatContext.tsx';

function StatusDot() {
  const { status } = useChat();
  const map = {
    idle:      { color: 'bg-white/30', label: 'ready' },
    waiting:   { color: 'bg-white animate-pulse', label: 'searching' },
    connected: { color: 'bg-white', label: 'live' },
    skipped:   { color: 'bg-white/30', label: 'ended' },
  };
  const { color, label } = map[status];
  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-xs text-white/60 tracking-widest uppercase font-medium">{label}</span>
    </div>
  );
}

export function ChatPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const { messages } = useChat();

  // Count unread when drawer is closed
  const unread = chatOpen ? 0 : messages.filter(m => m.sender === 'stranger').length;

  return (
    <div className="bg-black h-screen-safe flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 md:px-5 py-3 shrink-0 border-b border-white/8">
        <span className="font-display font-bold text-sm md:text-base tracking-tight text-white">
          meet<span className="text-white/30">.</span>
        </span>

        <div className="flex items-center gap-3">
          <StatusDot />

          {/* Chat toggle — mobile only */}
          <button
            onClick={() => setChatOpen(o => !o)}
            aria-label="Toggle chat"
            className="md:hidden relative w-8 h-8 flex items-center justify-center rounded-full bg-white/8 border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex flex-1 gap-3 p-3 min-h-0 overflow-hidden">

        {/* Video panel — fills all available space */}
        <div className="flex-1 min-w-0 min-h-0">
          <VideoPanel />
        </div>

        {/* Chat sidebar — desktop only */}
        <div className="w-72 xl:w-80 shrink-0 hidden md:flex flex-col min-h-0">
          <ChatPanel />
        </div>
      </main>

      {/* ── Controls ── */}
      <footer className="px-4 py-3 shrink-0 border-t border-white/8">
        <Controls />
      </footer>

      {/* ── Mobile chat drawer ── */}
      {/* No backdrop — drawer floats over bottom so video stays visible */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          flex flex-col
          bg-[#111]/95 backdrop-blur-md border-t border-white/10 rounded-t-2xl
          shadow-2xl
          transition-transform duration-300 ease-out
          ${chatOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ height: '42dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-8 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b border-white/8">
          <span className="text-xs font-semibold text-white/60 tracking-widest uppercase">Messages</span>
          <button
            onClick={() => setChatOpen(false)}
            aria-label="Close chat"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/8 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat content */}
        <div className="flex-1 min-h-0">
          <ChatPanel hideHeader />
        </div>
      </div>
    </div>
  );
}

import { VideoPanel } from '../components/VideoPanel.tsx';
import { ChatPanel } from '../components/ChatPanel.tsx';
import { Controls } from '../components/Controls.tsx';
import { useChat } from '../context/ChatContext.tsx';

function StatusDot() {
  const { status } = useChat();

  const map = {
    idle:      { color: 'bg-white/20', label: 'ready' },
    waiting:   { color: 'bg-white/60 animate-pulse', label: 'searching' },
    connected: { color: 'bg-white',    label: 'live' },
    skipped:   { color: 'bg-white/20', label: 'ended' },
  };

  const { color, label } = map[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-xs text-white/30 tracking-widest uppercase">{label}</span>
    </div>
  );
}

export function ChatPage() {
  return (
    <div className="bg-black h-screen flex flex-col overflow-hidden">

      {/* Header — ultra minimal */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0">
        <span className="font-display font-bold text-sm tracking-tight text-white">
          stranger<span className="text-white/20">.</span>
        </span>
        <StatusDot />
      </header>

      {/* Body */}
      <main className="flex flex-1 gap-3 px-3 pb-0 min-h-0">
        {/* Video */}
        <div className="flex-1 min-w-0 min-h-0">
          <VideoPanel />
        </div>

        {/* Chat — hidden on mobile */}
        <div className="w-72 xl:w-80 shrink-0 hidden md:flex flex-col min-h-0 pb-3">
          <ChatPanel />
        </div>
      </main>

      {/* Controls */}
      <footer className="px-5 py-4 shrink-0">
        <Controls />
      </footer>
    </div>
  );
}

import { useChat } from '../context/ChatContext.tsx';

interface IconBtnProps {
  onClick: () => void;
  label: string;
  off?: boolean;
  children: React.ReactNode;
}

function IconBtn({ onClick, label, off, children }: IconBtnProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-11 h-11 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90
        ${off
          ? 'bg-white text-black'
          : 'bg-white/10 hover:bg-white/15 text-white/70 hover:text-white border border-white/15'
        }`}
    >
      {children}
    </button>
  );
}

interface PillBtnProps {
  onClick: () => void;
  label: string;
  variant: 'white' | 'ghost';
  children: React.ReactNode;
}

function PillBtn({ onClick, label, variant, children }: PillBtnProps) {
  const styles = {
    white: 'bg-white text-black hover:bg-white/90 font-semibold',
    ghost: 'bg-transparent text-white/60 hover:text-white border border-white/15 hover:border-white/30 font-medium',
  };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full text-sm transition-all duration-150 active:scale-95 ${styles[variant]}`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function Controls() {
  const { status, isMuted, isCameraOff, skip, stop, toggleMute, toggleCamera } = useChat();

  const isWaiting = status === 'waiting';
  const isActive  = status === 'connected' || status === 'waiting' || status === 'skipped';

  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center gap-3">

      {/* Mic */}
      <IconBtn onClick={toggleMute} label={isMuted ? 'Unmute' : 'Mute'} off={isMuted}>
        {isMuted ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
          </svg>
        )}
      </IconBtn>

      {/* Camera */}
      <IconBtn onClick={toggleCamera} label={isCameraOff ? 'Camera on' : 'Camera off'} off={isCameraOff}>
        {isCameraOff ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10" />
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        )}
      </IconBtn>

      <div className="w-px h-6 bg-white/15" />

      {/* Stop */}
      <PillBtn onClick={stop} label="Stop" variant="ghost">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
          <rect x="3" y="3" width="10" height="10" rx="1.5" />
        </svg>
      </PillBtn>

      {/* Next */}
      {!isWaiting && (
        <PillBtn onClick={skip} label="Next" variant="white">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </PillBtn>
      )}
    </div>
  );
}

import { useChat } from '../context/ChatContext.tsx';

export function VideoPanel() {
  const { localVideoRef, remoteVideoRef, status } = useChat();

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] rounded-2xl overflow-hidden">

      {/* Remote feed */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Empty states */}
      {status !== 'connected' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">

          {status === 'waiting' && (
            <>
              {/* Minimal spinner — just a thin arc */}
              <svg className="w-8 h-8 animate-spin text-white/20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-white/30 text-xs tracking-widest uppercase">searching</p>
            </>
          )}

          {status === 'skipped' && (
            <>
              {/* X mark */}
              <svg className="w-8 h-8 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-white/30 text-xs tracking-widest uppercase">disconnected</p>
            </>
          )}

          {status === 'idle' && (
            <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          )}
        </div>
      )}

      {/* Live badge */}
      {status === 'connected' && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] text-white/60 font-medium tracking-wide">LIVE</span>
        </div>
      )}

      {/* Local PiP */}
      <div className="absolute bottom-4 right-4 w-36 h-24 rounded-xl overflow-hidden border border-white/10 bg-black">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-0.5">
          <span className="text-[9px] text-white/30 tracking-widest uppercase">you</span>
        </div>
      </div>
    </div>
  );
}

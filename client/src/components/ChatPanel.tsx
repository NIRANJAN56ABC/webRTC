import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext.tsx';
import type { ChatMessage } from '../types/index.ts';

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isMe = msg.sender === 'me';
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
      <div className="flex flex-col gap-0.5 max-w-[80%]">
        <div
          className={`px-3.5 py-2 text-sm leading-relaxed break-words rounded-2xl ${
            isMe
              ? 'bg-white text-black rounded-br-sm'
              : 'bg-white/8 text-white/80 border border-white/8 rounded-bl-sm'
          }`}
        >
          {msg.text}
        </div>
        <span className={`text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity px-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canChat = status === 'connected';

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/6">

      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/6 flex items-center justify-between shrink-0">
        <span className="text-xs font-medium text-white/30 tracking-widest uppercase">Messages</span>
        {messages.length > 0 && (
          <span className="text-xs text-white/20">{messages.length}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-white/15 text-center leading-relaxed">
              {canChat ? 'Say something…' : 'No messages yet'}
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/6 flex gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!canChat}
          placeholder={canChat ? 'Type a message…' : 'Waiting…'}
          maxLength={500}
          className="flex-1 bg-white/5 text-white/80 placeholder-white/20 text-sm px-3.5 py-2.5 rounded-xl border border-white/8 focus:outline-none focus:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!canChat || !input.trim()}
          aria-label="Send"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-black disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/90 transition-all active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../services/socket.ts';
import { useWebRTC } from '../hooks/useWebRTC.ts';
import type { AppStatus, ChatMessage } from '../types/index.ts';

interface ChatContextValue {
  status: AppStatus;
  messages: ChatMessage[];
  isMuted: boolean;
  isCameraOff: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  start: () => void;
  skip: () => void;
  stop: () => void;
  sendMessage: (text: string) => void;
  toggleMute: () => void;
  toggleCamera: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const partnerIdRef = useRef<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleRemoteStream = useCallback((_stream: MediaStream) => {
    // Stream is already attached in useWebRTC via remoteVideoRef
  }, []);

  const {
    startCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closePeerConnection,
    stopLocalStream,
    toggleMute: rtcToggleMute,
    toggleCamera: rtcToggleCamera,
    getLocalStream,
  } = useWebRTC(localVideoRef, remoteVideoRef, handleRemoteStream);

  const addSystemMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        sender: 'stranger',
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Register socket event listeners once
  useEffect(() => {
    const socket = getSocket();

    socket.on('waiting', () => {
      setStatus('waiting');
      setMessages([]);
    });

    socket.on('matched', async ({ partnerId, isInitiator }) => {
      partnerIdRef.current = partnerId;
      setStatus('connected');
      setMessages([]);
      await startCall(partnerId, isInitiator);
    });

    socket.on('offer', async ({ sdp }) => {
      if (partnerIdRef.current) {
        await handleOffer(sdp, partnerIdRef.current);
      }
    });

    socket.on('answer', async ({ sdp }) => {
      await handleAnswer(sdp);
    });

    socket.on('iceCandidate', async ({ candidate }) => {
      await handleIceCandidate(candidate);
    });

    socket.on('chatMessage', ({ message, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: message,
          sender: 'stranger',
          timestamp,
        },
      ]);
    });

    socket.on('partnerDisconnected', () => {
      closePeerConnection();
      partnerIdRef.current = null;
      setStatus('skipped');
      addSystemMessage('Stranger has disconnected.');
    });

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
    });

    return () => {
      socket.off('waiting');
      socket.off('matched');
      socket.off('offer');
      socket.off('answer');
      socket.off('iceCandidate');
      socket.off('chatMessage');
      socket.off('partnerDisconnected');
      socket.off('error');
    };
  }, [startCall, handleOffer, handleAnswer, handleIceCandidate, closePeerConnection, addSystemMessage]);

  const start = useCallback(async () => {
    connectSocket();
    // Pre-acquire camera/mic so local video shows while waiting
    await getLocalStream();
    getSocket().emit('findMatch');
  }, [getLocalStream]);

  const skip = useCallback(() => {
    closePeerConnection();
    partnerIdRef.current = null;
    getSocket().emit('skip');
  }, [closePeerConnection]);

  const stop = useCallback(() => {
    closePeerConnection();
    stopLocalStream();
    partnerIdRef.current = null;
    getSocket().emit('stop');
    disconnectSocket();
    setStatus('idle'); // go back to landing page
    setMessages([]);
    setIsMuted(false);
    setIsCameraOff(false);
  }, [closePeerConnection, stopLocalStream]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || status !== 'connected') return;
    getSocket().emit('chatMessage', { message: text.trim() });
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: text.trim(),
        sender: 'me',
        timestamp: Date.now(),
      },
    ]);
  }, [status]);

  const toggleMute = useCallback(() => {
    const enabled = rtcToggleMute();
    setIsMuted(!enabled);
  }, [rtcToggleMute]);

  const toggleCamera = useCallback(() => {
    const enabled = rtcToggleCamera();
    setIsCameraOff(!enabled);
  }, [rtcToggleCamera]);

  return (
    <ChatContext.Provider
      value={{
        status,
        messages,
        isMuted,
        isCameraOff,
        localVideoRef,
        remoteVideoRef,
        start,
        skip,
        stop,
        sendMessage,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}

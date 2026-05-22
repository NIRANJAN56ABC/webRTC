import { useRef, useCallback, useEffect } from 'react';
import { getSocket } from '../services/socket.ts';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

export function useWebRTC(
  localVideoRef: React.RefObject<HTMLVideoElement | null>,
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>,
  onRemoteStream: (stream: MediaStream) => void,
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // Whenever remoteVideoRef becomes available, attach any pending stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  });

  // Whenever localVideoRef becomes available, attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  });

  const getLocalStream = useCallback(async (): Promise<MediaStream> => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: true,
    });
    localStreamRef.current = stream;
    // Attach immediately if ref is ready
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, [localVideoRef]);

  const createPeerConnection = useCallback(
    (partnerId: string): RTCPeerConnection => {
      // Close any existing connection first
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      const socket = getSocket();

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('iceCandidate', { candidate: candidate.toJSON(), to: partnerId });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[ICE]', pc.iceConnectionState);
      };

      pc.onconnectionstatechange = () => {
        console.log('[PC]', pc.connectionState);
      };

      pc.ontrack = (event) => {
        console.log('[ontrack]', event.streams.length, event.track.kind);
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        remoteStreamRef.current = stream;
        // Attach directly — most reliable approach
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          // Force play on mobile
          remoteVideoRef.current.play().catch(() => {});
        }
        onRemoteStream(stream);
      };

      return pc;
    },
    [remoteVideoRef, onRemoteStream],
  );

  const startCall = useCallback(
    async (partnerId: string, isInitiator: boolean) => {
      const socket = getSocket();
      const stream = await getLocalStream();
      const pc = createPeerConnection(partnerId);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      if (isInitiator) {
        // Give non-initiator time to set up
        await new Promise(resolve => setTimeout(resolve, 600));
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socket.emit('offer', { sdp: offer, to: partnerId });
      }
    },
    [getLocalStream, createPeerConnection],
  );

  const handleOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit, partnerId: string) => {
      const socket = getSocket();
      const pc = pcRef.current;
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { sdp: answer, to: partnerId });
    },
    [],
  );

  const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      // Ignore stale candidates
    }
  }, []);

  const closePeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    remoteStreamRef.current = null;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteVideoRef]);

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [localVideoRef]);

  const toggleMute = useCallback((): boolean => {
    const stream = localStreamRef.current;
    if (!stream) return false;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return false;
    audioTrack.enabled = !audioTrack.enabled;
    return audioTrack.enabled;
  }, []);

  const toggleCamera = useCallback((): boolean => {
    const stream = localStreamRef.current;
    if (!stream) return false;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return false;
    videoTrack.enabled = !videoTrack.enabled;
    return videoTrack.enabled;
  }, []);

  return {
    startCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closePeerConnection,
    stopLocalStream,
    toggleMute,
    toggleCamera,
    getLocalStream,
  };
}

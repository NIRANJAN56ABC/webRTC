import { useRef, useCallback } from 'react';
import { getSocket } from '../services/socket.ts';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC(
  localVideoRef: React.RefObject<HTMLVideoElement | null>,
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>,
  onRemoteStream: (stream: MediaStream) => void,
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const getLocalStream = useCallback(async (): Promise<MediaStream> => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, [localVideoRef]);

  const createPeerConnection = useCallback(
    (partnerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      const socket = getSocket();

      // Send ICE candidates to partner via server
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('iceCandidate', { candidate: candidate.toJSON(), to: partnerId });
        }
      };

      // When remote track arrives, attach to remote video
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        onRemoteStream(remoteStream);
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

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (isInitiator) {
        const offer = await pc.createOffer();
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

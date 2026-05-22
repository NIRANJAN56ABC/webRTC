export type AppStatus =
  | 'idle'       // landing page, not started
  | 'waiting'    // in queue, looking for a match
  | 'connected'  // matched and in a call
  | 'skipped';   // partner disconnected / user skipped

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'stranger';
  timestamp: number;
}

export interface ServerToClientEvents {
  matched: (data: { partnerId: string; isInitiator: boolean }) => void;
  waiting: () => void;
  partnerDisconnected: () => void;
  offer: (data: { sdp: RTCSessionDescriptionInit }) => void;
  answer: (data: { sdp: RTCSessionDescriptionInit }) => void;
  iceCandidate: (data: { candidate: RTCIceCandidateInit }) => void;
  chatMessage: (data: { message: string; timestamp: number }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  findMatch: () => void;
  skip: () => void;
  stop: () => void;
  offer: (data: { sdp: RTCSessionDescriptionInit; to: string }) => void;
  answer: (data: { sdp: RTCSessionDescriptionInit; to: string }) => void;
  iceCandidate: (data: { candidate: RTCIceCandidateInit; to: string }) => void;
  chatMessage: (data: { message: string }) => void;
}

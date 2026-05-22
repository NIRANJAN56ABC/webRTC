export interface WaitingUser {
  socketId: string;
  joinedAt: number;
}

export interface ActivePair {
  user1: string;
  user2: string;
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

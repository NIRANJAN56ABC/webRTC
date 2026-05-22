import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  WaitingUser,
} from '../types/index.js';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

// Queue of users waiting for a match
const waitingQueue: WaitingUser[] = [];

// Map of socketId -> partnerId for active pairs
const activePairs = new Map<string, string>();

function removeFromQueue(socketId: string): void {
  const idx = waitingQueue.findIndex((u) => u.socketId === socketId);
  if (idx !== -1) waitingQueue.splice(idx, 1);
}

function disconnectPair(socketId: string, io: AppServer): void {
  const partnerId = activePairs.get(socketId);
  if (partnerId) {
    activePairs.delete(socketId);
    activePairs.delete(partnerId);
    // Notify partner
    io.to(partnerId).emit('partnerDisconnected');
  }
}

export function registerSocketHandlers(io: AppServer): void {
  io.on('connection', (socket: AppSocket) => {
    console.log(`[+] Connected: ${socket.id}`);

    // User wants to find a match
    socket.on('findMatch', () => {
      // If already in a pair, ignore
      if (activePairs.has(socket.id)) return;

      // Remove any stale queue entry
      removeFromQueue(socket.id);

      if (waitingQueue.length > 0) {
        // Match with the first waiting user
        const partner = waitingQueue.shift()!;

        activePairs.set(socket.id, partner.socketId);
        activePairs.set(partner.socketId, socket.id);

        // Tell both who they matched with
        // The first in queue becomes the initiator (creates the offer)
        socket.emit('matched', {
          partnerId: partner.socketId,
          isInitiator: false,
        });
        io.to(partner.socketId).emit('matched', {
          partnerId: socket.id,
          isInitiator: true,
        });

        console.log(`[~] Matched: ${socket.id} <-> ${partner.socketId}`);
      } else {
        // Add to waiting queue
        waitingQueue.push({ socketId: socket.id, joinedAt: Date.now() });
        socket.emit('waiting');
        console.log(`[?] Waiting: ${socket.id} (queue: ${waitingQueue.length})`);
      }
    });

    // User skips current partner and looks for a new one
    socket.on('skip', () => {
      disconnectPair(socket.id, io);
      removeFromQueue(socket.id);

      // Re-queue
      if (waitingQueue.length > 0) {
        const partner = waitingQueue.shift()!;

        activePairs.set(socket.id, partner.socketId);
        activePairs.set(partner.socketId, socket.id);

        socket.emit('matched', {
          partnerId: partner.socketId,
          isInitiator: false,
        });
        io.to(partner.socketId).emit('matched', {
          partnerId: socket.id,
          isInitiator: true,
        });

        console.log(`[~] Re-matched: ${socket.id} <-> ${partner.socketId}`);
      } else {
        waitingQueue.push({ socketId: socket.id, joinedAt: Date.now() });
        socket.emit('waiting');
        console.log(`[?] Re-queued: ${socket.id}`);
      }
    });

    // User stops entirely
    socket.on('stop', () => {
      disconnectPair(socket.id, io);
      removeFromQueue(socket.id);
      console.log(`[-] Stopped: ${socket.id}`);
    });

    // WebRTC signaling relay — offer
    socket.on('offer', ({ sdp, to }) => {
      io.to(to).emit('offer', { sdp });
    });

    // WebRTC signaling relay — answer
    socket.on('answer', ({ sdp, to }) => {
      io.to(to).emit('answer', { sdp });
    });

    // WebRTC signaling relay — ICE candidate
    socket.on('iceCandidate', ({ candidate, to }) => {
      io.to(to).emit('iceCandidate', { candidate });
    });

    // Chat message relay
    socket.on('chatMessage', ({ message }) => {
      const partnerId = activePairs.get(socket.id);
      if (!partnerId) return;

      // Sanitize: strip HTML, limit length
      const sanitized = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 500);

      io.to(partnerId).emit('chatMessage', {
        message: sanitized,
        timestamp: Date.now(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      disconnectPair(socket.id, io);
      removeFromQueue(socket.id);
      console.log(`[-] Disconnected: ${socket.id}`);
    });
  });
}

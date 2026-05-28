import type { GameSession, WaitingPlayer } from '../../types/gamesession.ts'
import type { Socket } from 'socket.io'

export let waitingPlayers: WaitingPlayer[] = []
export let sessions: GameSession[] = []

export function clearWaitingPlayers() { waitingPlayers = [] }
export function addSession(s: GameSession) { sessions.push(s) }
export function findSession(socketId: string): GameSession | undefined {
    return sessions.find(s => s.sockets.some(sock => sock.id === socketId))
}
export function findSessionByRoomId(roomId: number): GameSession | undefined {
    return sessions.find(s => s.roomId === roomId)
}
export function addSpectator(session: GameSession, socket: Socket) {
    session.spectators.push(socket)
}
export function removeSpectator(session: GameSession, socketId: string) {
    session.spectators = session.spectators.filter(s => s.id !== socketId)
}
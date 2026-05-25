import type { GameSession, WaitingPlayer } from '../types/gamesession.ts'

export let waitingPlayers: WaitingPlayer[] = []
export let sessions: GameSession[] = []

export function clearWaitingPlayers() { waitingPlayers = [] }
export function addSession(s: GameSession) { sessions.push(s) }
export function findSession(socketId: string): GameSession | undefined {
    return sessions.find(s => s.sockets.some(sock => sock.id === socketId))
}
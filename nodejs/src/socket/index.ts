import { Server } from 'socket.io'
import { onConnection } from './handlers.ts'
import { waitingPlayers, sessions } from './state.ts'

export { instantiateGame } from './gameFactory.ts'

export function initSocket(io: Server): void {
    io.on('connection', (socket) => {
        console.log('Joueur connecté :', socket.id)
        onConnection(io, socket)
    })
}
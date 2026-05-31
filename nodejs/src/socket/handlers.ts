import { Server, Socket } from 'socket.io'
import type { BfZone } from '../types/zones.ts'
import type { Card } from '../types/card.ts'
import type { GameSession } from '../types/gamesession.ts'
import { instantiateGame } from './gameFactory.ts'
import { launchGame, resolveRound } from './round.ts'
import { getPlayerPerspective, getSpectatorPerspective } from './perspective.ts'
import { waitingPlayers, sessions, clearWaitingPlayers, addSession, findSession, findSessionByRoomId, addSpectator, removeSpectator } from './state.ts'
import { playCard } from '../engine/playCard.ts'
import { emitGameOver } from './round.ts'
import { prisma } from '../../prisma/prisma.ts'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme'

export function onConnection(io: Server, socket: Socket): void {

    socket.on('join_game', async (data) => {

    let userId: number | null = null
    if (data.token) {
        try {
            const decoded = jwt.verify(data.token, JWT_SECRET) as any
            userId = decoded.userId
        } catch {}
    }
    
    const existingSession = findSessionByRoomId(Number(data.roomId))
        if (existingSession) {
            // Trouve quel joueur c'est selon son username
            const playerIndex = existingSession.game.players.findIndex(
                (p: any) => p.username === data.username
            )
            if (playerIndex !== -1) {
                // Remplace le vieux socket par le nouveau
                existingSession.sockets[playerIndex] = socket
                // Renvoie l'état de la game
                socket.emit('game_start', {
                    playerIndex,
                    game: getPlayerPerspective(existingSession.game, playerIndex)
                })
                return
            }
        }


        waitingPlayers.push({ socket, playerData: { ...data, userId } })

        if (waitingPlayers.length === 2) {
            const players = [...waitingPlayers]
            clearWaitingPlayers()
            try {
                const gameInstance = await instantiateGame(players)
                const newSession: GameSession = {
                    roomId: Number(players[0].playerData.roomId), // les deux ont le même
                    game: gameInstance,
                    sockets: players.map(p => p.socket),
                    submittedCards: new Map(),
                    readyPlayers: new Set(),
                    timer: null,
                    spectators: []
                }
                
                addSession(newSession)
                launchGame(newSession)
            } catch (error) {
                console.error('Erreur lancement game:', error)
                socket.emit('error', { message: 'Impossible de charger les données du héros' })
            }
        }
    })

    socket.on('play_card', (data) => {
        console.log('Reçu play_card', { data })
        const session = findSession(socket.id)
        if (!session) return

        const playerIndex = session.sockets.findIndex(s => s.id === socket.id)
        const player = session.game.players[playerIndex]
        const card = player.hand.find(c => c.idInGame === data.cardId)
        // console.log('Carte trouvée:', { card })
        if (!card) return
        if (player.curRunes < card.runeCost) return
        player.curRunes -= card.runeCost

        if (card.timing === 'immediate') {
            playCard(card, { cardId: data.cardId, zone: data.zone, targets: data.targets }, session.game)
        } else {
            const zone = data.zone as BfZone
            if (session.game.players[playerIndex].battlefield[zone]) return
            const existing = session.submittedCards.get(socket.id) ?? []
            if (existing.some(({ payload }: any) => payload.zone === zone)) return
            existing.push({ card, payload: data })
            session.submittedCards.set(socket.id, existing)
            card.owner.hand = card.owner.hand.filter((c: Card) => c.idInGame !== card.idInGame)
        }

        socket.emit('game_update', { game: getPlayerPerspective(session.game, playerIndex) })
    })

        socket.on('end_turn', () => {
            console.log('Reçu end_turn de', socket.id)
            const session = findSession(socket.id)
            if (!session) return

            session.readyPlayers.add(socket.id)
            if (session.readyPlayers.size === session.sockets.length) {
                session.readyPlayers.clear()

                resolveRound(session)
                session.sockets.forEach((s, id) => {
                    s.emit('game_update', { game: getPlayerPerspective(session.game, id) })
                })
                session.spectators.forEach(s => {
                    s.emit('game_update', { game: getSpectatorPerspective(session.game) })
            })
        }
    })

    socket.on('spectate', (roomId: number) => {
        console.log('Spectate roomId:', roomId, typeof roomId)
        console.log('Sessions:', sessions.map(s => ({ roomId: s.roomId, type: typeof s.roomId })))

        const session = findSessionByRoomId(roomId)
        if (!session) {
            socket.emit('spectate_error', 'Game not found')
            return
        }
        addSpectator(session, socket)
        socket.emit('game_update', { game: getSpectatorPerspective(session.game) })

        socket.on('disconnect', () => {
            removeSpectator(session, socket.id)
        })
    })

    socket.on('concede', async () => {
        const session = findSession(socket.id)
        if (!session) return

        const playerIndex = session.sockets.findIndex(s => s.id === socket.id)
        const winnerIndex = 1 - playerIndex

        session.game.status = 'game_over'
        session.game.winner = session.game.players[winnerIndex]
        await emitGameOver(session)
    })
    socket.on('disconnect', () => {
        console.log('Joueur déconnecté :', socket.id)
    })

    socket.on('send_message', async (data) => {
        try{
            const { username, content, roomId } = data;
            if (!username || !content?.trim())
                return;
            const user = await prisma.user.findUnique({
                where: { username }
            });
            if (!user)
                return;
            
            const message = await prisma.message.create({
                data: {
                    senderId: user.id,
                    content: content.trim(),
                    roomId: roomId ?? null,
                },
                include: {
                    sender: true,
                }
            });
            io.emit('new_message', message);
        }
        catch (error)
        {
            console.error(error);
            socket.emit('chat_error', {
                message: "Failed to send message"
            });
        }
    });

    socket.on('create_room', async (data, callback) => {
        try {
            const { username } = data;
            if ( !username )
                return;
            const user = 
                await prisma.user.findUnique({
                    where: {
                        username
                    }
            });
            if (!user)
                return;
            const room =
                await prisma.room.create({
                data: {
                    player1Id: user.id,
                    status: "waiting",
                },
                include: {
                    player1: true,
                    player2: true,
                }
            });
            io.emit('room_updated', room);
            callback(room);
        }
        catch (error)
        {
            console.error(error);
            socket.emit('room_error', {
                message: "Failed to create a room"
            });
        }
    });

    socket.on('join_room', async (data, callback) => {
        try{
            const { roomId, username } = data;
            if (!roomId || !username)
                return;
            
            const user = await prisma.user.findUnique({
                where: {username}
            });
            if (!user)
                return;
            
            const room = await prisma.room.findUnique({
                where: {id: roomId}
            });
            if (!room)
                return;
            if (room.player2Id) {
                socket.emit('room_error', {
                    message: 'Room is full'
                });
                return;
            }
        
            const updateRoom = 
                await prisma.room.update({
                    where: { id: roomId },
                    data: {
                        player2Id: user.id,
                        status: "ready",
                    },
                    include: {
                        player1: true,
                        player2: true,
                    }
                });
            io.emit('room_updated', updateRoom);
            callback(room);
        }
        catch (error)
        {
            console.error(error);
            socket.emit('room_error', {
                message: 'Failed to join room'
            });
        }
    });

}
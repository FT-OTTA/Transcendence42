import { Server, Socket } from 'socket.io'
import type { BfZone } from '../types/zones.ts'
import type { Card } from '../types/card.ts'
import type { Hero } from '../types/hero.ts'
import type { GameSession } from '../types/gamesession.ts'
import { instantiateGame } from './gameFactory.ts'
import { launchGame, resolveRound } from './round.ts'
import { getPlayerPerspective } from './perspective.ts'
import { waitingPlayers, sessions, clearWaitingPlayers, addSession, findSession } from './state.ts'
import { playCard } from '../engine/playCard.ts'
import { findById } from '../engine/utils.ts'


export function onConnection(io: Server, socket: Socket): void {

    socket.on('join_game', async (data) => {
        waitingPlayers.push({ socket, playerData: data })

        if (waitingPlayers.length === 2) {
            const players = [...waitingPlayers]
            clearWaitingPlayers()
            try {
                const gameInstance = await instantiateGame(players)
                const newSession: GameSession = {
                    game: gameInstance,
                    sockets: players.map(p => p.socket),
                    submittedCards: new Map(),
                    readyPlayers: new Set(),
                    timer: null
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
                session.readyPlayers.clear() // ← reset avant le prochain tour
                resolveRound(session)
                session.sockets.forEach((s, id) => {
                    s.emit('game_update', { game: getPlayerPerspective(session.game, id) })
                })
        }
    })

    socket.on('disconnect', () => {
        console.log('Joueur déconnecté :', socket.id)
    })
}
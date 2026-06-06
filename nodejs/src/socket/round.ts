import type { GameSession } from '../types/gamesession.ts'
import type { Hero } from '../types/hero.ts'
import type { Card } from '../types/card.ts'
import { resolveCombat } from '../engine/resolveEffects.ts'
import { playCard } from '../engine/playCard.ts'
import { startTurn } from '../engine/startTurn.ts'
import { checkBoardState, checkVictory } from '../engine/checks.ts'
import { getPlayerPerspective } from './perspective.ts'
import { prisma } from '../../prisma/prisma.ts'

export async function emitGameOver(session: GameSession) {
    const winnerIndex = session.game.winner ? session.game.players.indexOf(session.game.winner) : -1
    session.sockets.forEach((s, id) => {
        s.emit('game_over', { game: getPlayerPerspective(session.game, id), winner: winnerIndex })
    })
    session.spectators.forEach(s => {
        s.emit('game_over', { winner: winnerIndex })
    })
    await prisma.room.deleteMany({ where: { id: session.roomId } })
    try {
        await prisma.gameResult.create({
        data: {
            winnerId: winnerIndex !== -1 ? session.game.players[winnerIndex].userId : null,
            loserId: winnerIndex !== -1 ? session.game.players[1 - winnerIndex].userId : null,
            player1Id: session.game.players[0].userId,
            player2Id: session.game.players[1].userId,
            player1Class: session.game.players[0].class,
            player2Class: session.game.players[1].class,
            turns: session.game.turnNumber,
            player1Score: session.game.players[0].dmgDealt,
            player2Score: session.game.players[1].dmgDealt,
            }
        })
    } catch (error) {
        console.error('Error saving game result:', error)
    }
    console.log('emitGameOver winnerIndex:', winnerIndex)
    console.log('players:', session.game.players.map(p => p.userId))

}

export async function resolveRound(session: GameSession): Promise<void> {
    console.log('Résolution du tour', session.game.turnNumber)
    if (session.timer === null)
        session.sockets.forEach(s => s.emit('timeout', {}))

    clearTimeout(session.timer!)
    session.timer = null
    const emit = (event: string, data: any) => {
        session.sockets.forEach(s => s.emit(event, data));
        session.spectators.forEach(s => s.emit(event, data));
    };

    for (const [socketId, cards] of session.submittedCards) {
        const playerIndex = session.sockets.findIndex(s => s.id === socketId)
        const player = session.game.players[playerIndex]

        for (const { card, payload } of cards) {
            if (!card) continue
            playCard(card, payload, session.game, emit, 'end_of_turn')
        }
    }
    session.submittedCards.clear()
    session.readyPlayers.clear()

    if (checkBoardState(session.game) === "game_over") {
        await emitGameOver(session)
        return;
    }

    resolveCombat(session.game, emit)

    if (checkBoardState(session.game) === "game_over") {
        await emitGameOver(session)
        return;
    }

    session.game.turnNumber += 1

    if (session.game.turnNumber > 8) {
        const winner = checkVictory(session.game)
        session.game.winner = winner ?? undefined
        await emitGameOver(session)
    } else {
        startTurn(session.game, emit)
        checkBoardState(session.game);
        session.timer = setTimeout(() => resolveRound(session), session.game.clock_per_turn * 1000)
        session.sockets.forEach((s, id) => {
            s.emit('turn_start', { game: getPlayerPerspective(session.game, id) })
        })
        for (const player of session.game.players)
            for (const card of Object.values(player.battlefield))
                if (card && card.state === "sick") card.state = "ready";
    }
}

export function launchGame(session: GameSession): void {
    console.log('Lancement de game pour sockets', session.sockets.map(s => s.id))
    const emit = (event: string, data: any) => {
        session.sockets.forEach(s => s.emit(event, data));
    };

    startTurn(session.game, emit)
    session.timer = setTimeout(() => resolveRound(session), session.game.clock_per_turn * 1000)
    session.sockets.forEach((s, id) => {
        s.emit('game_start', { game: getPlayerPerspective(session.game, id), playerIndex: id })
    })
}
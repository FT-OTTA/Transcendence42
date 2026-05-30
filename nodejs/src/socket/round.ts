import type { GameSession } from '../types/gamesession.ts'
import type { Hero } from '../types/hero.ts'
import type { Card } from '../types/card.ts'
import { resolveCombat } from '../engine/resolveEffects.ts'
import { playCard } from '../engine/playCard.ts'
import { startTurn } from '../engine/startTurn.ts'
import { checkBoardState, checkVictory } from '../engine/checks.ts'
import { getPlayerPerspective } from './perspective.ts'
import { prisma } from '../../prisma/prisma.ts'

async function emitGameOver(session: GameSession) {
    const winnerIndex = session.game.winner ? session.game.players.indexOf(session.game.winner) : -1
    session.sockets.forEach((s, id) => {
        s.emit('game_over', { game: getPlayerPerspective(session.game, id), winner: winnerIndex })
    })
    await prisma.room.delete({ where: { id: session.roomId } })
    await prisma.gameResult.create({
    data: {
        winnerId: winnerIndex !== -1 ? session.game.players[winnerIndex].userId : undefined,
        loserId: winnerIndex !== -1 ? session.game.players[1 - winnerIndex].userId : undefined,
        turns: session.game.turnNumber
        }
    })
}

export async function resolveRound(session: GameSession): Promise<void> {
    console.log('Résolution du tour', session.game.turnNumber)
    if (session.timer === null)
        session.sockets.forEach(s => s.emit('timeout', {}))

    clearTimeout(session.timer!)
    session.timer = null

    for (const [socketId, cards] of session.submittedCards) {
        const playerIndex = session.sockets.findIndex(s => s.id === socketId)
        const player = session.game.players[playerIndex]

        for (const { card, payload } of cards) {
            if (!card) continue
            playCard(card, payload, session.game)
        }
    }
    session.submittedCards.clear()
    session.readyPlayers.clear()

    if (checkBoardState(session.game) === "game_over") {
        await emitGameOver(session)
        return;
    }

    resolveCombat(session.game)

    if (checkBoardState(session.game) === "game_over") {
        await emitGameOver(session)
        return;
    }

    session.game.turnNumber += 1

    if (session.game.turnNumber > 1) {
        const winner = checkVictory(session.game)
        session.game.winner = winner ?? undefined
        await emitGameOver(session)
    } else {
        startTurn(session.game)
        checkBoardState(session.game);
        session.timer = setTimeout(() => resolveRound(session), session.game.clock_per_turn * 1000)
        session.sockets.forEach((s, id) => {
            s.emit('turn_start', { game: getPlayerPerspective(session.game, id) })
        })
    }
}

export function launchGame(session: GameSession): void {
    console.log('Lancement de game pour sockets', session.sockets.map(s => s.id))
    startTurn(session.game)
    session.timer = setTimeout(() => resolveRound(session), session.game.clock_per_turn * 1000)
    session.sockets.forEach((s, id) => {
        s.emit('game_start', { game: getPlayerPerspective(session.game, id), playerIndex: id })
    })
}
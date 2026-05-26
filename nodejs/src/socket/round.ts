import type { GameSession } from '../types/gamesession.ts'
import type { BfZone } from '../types/zones.ts'
import type { Hero } from '../types/hero.ts'
import type { Card } from '../types/card.ts'
import { resolveCombat } from '../engine/resolveEffects.ts'
import { playCard } from '../engine/playCard.ts'
import { startTurn } from '../engine/startTurn.ts'
import { checkBoardState, checkVictory } from '../engine/checks.ts'
import { getPlayerPerspective } from './perspective.ts'

function findById(game: any, id: number): Hero | Card | undefined {
    for (const player of game.players) {
        if (player.idInGame === id) return player
        const card = [
            ...player.hand,
            ...player.library,
            ...Object.values(player.battlefield)
        ].find((c: any) => c?.idInGame === id)
        if (card) return card
    }
    return undefined
}

export function resolveRound(session: GameSession): void {
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

    if (checkBoardState(session.game) === "game_over") return;
    resolveCombat(session.game)
    if (checkBoardState(session.game) === "game_over") return;

    session.submittedCards.clear()
    session.readyPlayers.clear()
    session.game.turnNumber += 1

    if (session.game.turnNumber > 8) {
        const winner = checkVictory(session.game)
        const winnerIndex = winner ? session.game.players.indexOf(winner) : -1
        session.sockets.forEach((s, id) => {
            s.emit('game_over', { game: getPlayerPerspective(session.game, id), winner: winnerIndex })
        })
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
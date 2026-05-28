import type { Card } from '../../types/card.ts'
import type { Game } from '../../types/gamesession.ts'
import type { Hero } from '../../types/hero.ts'

export function findById(game: any, id: number): Hero | Card | undefined {
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
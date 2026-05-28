import type { Game } from '../types/gamesession.ts'
export function getSpectatorPerspective(game: Game) {
    return JSON.parse(JSON.stringify(game, (key, value) => {
        if (key === 'owner') return undefined
        if (key === 'library') return undefined  // pas besoin de la librairie
        return value
    }))
}
export function getPlayerPerspective(game: Game, playerIndex: number) {
    const copy = JSON.parse(JSON.stringify(game, (key, value) => {
        if (key === 'owner') return undefined
        return value
    }))
    copy.players.forEach((hero: any, index: number) => {
        if (index !== playerIndex) {
            hero.hand = hero.hand.map(() => ({ idInGame: -1, hidden: true }))
            hero.libraryCount = hero.library.length
            hero.library = []
        }
    })
    return copy
}
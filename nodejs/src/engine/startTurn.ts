import type { Hero } from '../types/hero.ts'
import type { Game } from '../types/gamesession.ts'
import type { BfZone } from '../types/zones.ts'
import { resolveBuildings, resolveEffect } from "./resolveEffects.ts";

export function fibonacci(n: number): number {
    if (n === 0 || n === 1)
        return 1;
    return fibonacci(n - 1) + fibonacci(n - 2)
}

export function playerDraw(player: Hero, n: number): boolean {
    if (n <= 0)
            return (false);
    while (player.library.length > 0 && n--)
        player.hand.push(player.library.pop()!);
    if (player.library.length === 0)
        return (false);
    return (true);
}

export function startTurn(game: Game, emit?: (event: string, data: any) => void): void {
    console.log(`Starting turn ${game.turnNumber}...`)
    for (const player of game.players) {
        for (const card of Object.values(player.battlefield)) {
            if (card && card.state === "sick") card.state = "ready";
        }
        player.curRunes = fibonacci(game.turnNumber + 1);
        if (game.debug) {
            player.curRunes = 999; // remove this line to have normal rune gain
            playerDraw(player, 24 - player.hand.length);// remove this line to have normal hand refill
        } else {
        playerDraw(player, 8 - player.hand.length);
        }
        for (const eff of player.passive) {
            resolveEffect(player, eff, { cardId: 0 }, game, 'start_turn', player, undefined, undefined, emit)
        }
        for (let i = 1; i <= 8; i++) {
            const card = player.battlefield[`bf${i}` as BfZone];
            if (card && card.type === "creature") {
                for (const eff of card.effects) {
                    if (eff.timing === 'start_turn')
                        resolveEffect(player, eff, { cardId: card.idInGame }, game, 'start_turn', undefined, undefined, undefined, emit);
                }
            }
        }
    }
    resolveBuildings(game, emit);
}


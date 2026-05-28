import type { Hero } from '../../types/hero.ts'
import type { Game } from '../../types/gamesession.ts'
import type { BfZone } from '../../types/zones.ts'

export function checkVictory(game: Game): Hero | null {
    if (game.status === "game_over") {
        return game.winner ?? null;
    }
    let max = 0;
    let draw = false;
    let winner: Hero | null = null;

    for (const player of game.players) {
        if (player.dmgDealt > max) {
            max = player.dmgDealt;
            winner = player;
            draw = false;
        } else if (player.dmgDealt === max) {
            draw = true;
        }
    }

    if (draw) return null;
    return winner;
}

export function checkBoardState(game: Game): "continue" | "game_over" {
    if (game.status === "game_over") return "game_over";

    // cleanup morts
    for (let i = 1; i <= 8; i++) {
        const zone = `bf${i}` as BfZone;

        for (const player of game.players) {
            const card = player.battlefield[zone];

            if (card && card.currEndurance <= 0) {
                card.zone = "graveyard";
                player.battlefield[zone] = undefined;
            }
        }
    }

    return "continue";
}
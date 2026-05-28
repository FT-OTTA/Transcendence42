import type { Hero } from '../../../types/hero.ts'
import type { Card } from '../../../types/card.ts'
import type { Game } from '../../../types/gamesession.ts'
import type { Effect } from '../../../types/effects.ts'

let _id = 1;
export const nextId = () => _id++;

export function makeCard(overrides: Partial<Card> = {}): Card {
    return {
        kind: "card",
        idInGame: nextId(),
        idInCollection: nextId(),
        cardName: "Test Card",
        effectText: "",
        type: "creature",
        class: "common",
        runeCost: 1,
        baseForce: 2,
        currForce: 2,
        baseEndurance: 3,
        currEndurance: 3,
        effect: "{}",
        effects: [],
        zone: null as any,
        owner: null as any,
        timing: "immediate",
        state: "ready",
        fullPicPath: "",
        smallPicPath: "",
        cardBackPath: "",
        ...overrides
    }
}

export function makeHero(overrides: Partial<Hero> = {}): Hero {
    return {
        kind: "hero",
        idInGame: nextId(),
        class: "Warrior",
        passive: { effect: "armor", value: 0, target: "self_hero" },
        armor: 0,
        dmgDealt: 0,
        curRunes: 10,
        battlefield: {},
        library: [],
        graveyard: [],
        hand: [],
        heroPicPath: "",
        ...overrides
    }
}

export function makeGame(player1?: Hero, player2?: Hero): Game {
    const p1 = player1 ?? makeHero()
    const p2 = player2 ?? makeHero()
    return {
        kind: "game",
        phase: "main",
        turnNumber: 1,
        clock_per_turn: 60,
        players: [p1, p2],
        backgroundPath: ""
    }
}

export function makeEffect(overrides: Partial<Effect> = {}): Effect {
    return {
        effect: "dmg",
        value: 1,
        target: "self_hero",
        ...overrides
    }
}

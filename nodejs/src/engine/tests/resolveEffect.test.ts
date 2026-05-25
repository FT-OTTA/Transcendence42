import { describe, it, expect, beforeEach } from 'vitest'
import { GameOver, resolveBuildings, resolveEffect } from '../resolveEffects.ts'
import { makeCard, makeHero, makeGame, makeEffect, nextId } from './mocks.ts'
import type { Hero } from '../../types/hero.ts'
import type { Card } from '../../types/card.ts'
import type { Game } from '../../types/gamesession.ts'

// ─── helpers ────────────────────────────────────────────────────────────────

function placeCard(hero: Hero, zone: `bf${number}`, card: Card) {
    card.zone = zone as any
    card.owner = hero
    hero.battlefield[zone as keyof typeof hero.battlefield] = card
}

function resolve(player: Hero, eff: ReturnType<typeof makeEffect>, game: Game, target?: Card | Hero, target2?: Card) {
    return resolveEffect(player, eff, { cardId: 0, target, target2 }, game)
}

// ─── dmg ────────────────────────────────────────────────────────────────────

describe('resolveEffect - dmg', () => {
    it('inflige des dégâts à un héros', () => {
        const player = makeHero()
        const opponent = makeHero({ armor: 0 })
        const game = makeGame(player, opponent)
        const eff = makeEffect({ effect: "dmg", value: 5, target: "opponent_hero" })

        resolve(player, eff, game, opponent)

        expect(player.dmgDealt).toBe(5)
    })

    it('inflige des dégâts à une créature', () => {
        const player = makeHero()
        const game = makeGame(player)
        const creature = makeCard({ currEndurance: 10 })
        const eff = makeEffect({ effect: "dmg", value: 3, target: "self" })

        resolve(player, eff, game, creature)

        expect(creature.currEndurance).toBe(7)
    })

    it('inflige des dégâts à toutes les créatures ennemies', () => {
        const player = makeHero()
        const opponent = makeHero()
        const game = makeGame(player, opponent)
        const c1 = makeCard({ currEndurance: 5 })
        const c2 = makeCard({ currEndurance: 5 })
        placeCard(opponent, 'bf1', c1)
        placeCard(opponent, 'bf2', c2)
        const eff = makeEffect({ effect: "dmg", value: 2, target: "all_enemies" })

        resolve(player, eff, game)

        expect(c1.currEndurance).toBe(3)
        expect(c2.currEndurance).toBe(3)
    })
})

// ─── destroy ────────────────────────────────────────────────────────────────

describe('resolveEffect - destroy', () => {
    it('détruit une créature ciblée', () => {
        const player = makeHero()
        const game = makeGame(player)
        const creature = makeCard({ currEndurance: 10 })
        const eff = makeEffect({ effect: "destroy", value: 0, target: "self" })

        resolve(player, eff, game, creature)

        expect(creature.currEndurance).toBe(0)
    })

    it('ne fait rien si aucune cible (pool vide)', () => {
        const player = makeHero()
        const opponent = makeHero() // battlefield vide
        const game = makeGame(player, opponent)
        const eff = makeEffect({
            effect: "destroy",
            value: 0,
            target: "random_enemies",
            targetType: { creature: true }
        })

        // Ne doit pas throw, et retourne false (pas de target)
        const result = resolve(player, eff, game)

        expect(result).toBe(false)
    })

    it('détruit toutes les créatures ennemies', () => {
        const player = makeHero()
        const opponent = makeHero()
        const game = makeGame(player, opponent)
        const c1 = makeCard({ currEndurance: 5 })
        const c2 = makeCard({ currEndurance: 8 })
        placeCard(opponent, 'bf1', c1)
        placeCard(opponent, 'bf2', c2)
        const eff = makeEffect({ effect: "destroy", value: 0, target: "all_enemies" })

        resolve(player, eff, game)

        expect(c1.currEndurance).toBe(0)
        expect(c2.currEndurance).toBe(0)
    })

    it("ne détruit pas le héros", () => {
        const player = makeHero()
        const opponent = makeHero()
        const game = makeGame(player, opponent)
        const eff = makeEffect({ effect: "destroy", value: 0, target: "opponent_hero" })

        const result = resolve(player, eff, game, opponent)

        expect(result).toBe(false)
    })
})

// ─── ad_mod / def_mod ────────────────────────────────────────────────────────

describe('resolveEffect - ad_mod / def_mod', () => {
    it('booste la force dune créature', () => {
        const player = makeHero()
        const game = makeGame(player)
        const creature = makeCard({ currForce: 2 })
        const eff = makeEffect({ effect: "ad_mod", value: 3, target: "self" })

        resolve(player, eff, game, creature)

        expect(creature.currForce).toBe(5)
    })

    it('booste la force de toutes les alliées', () => {
        const player = makeHero()
        const game = makeGame(player)
        const c1 = makeCard({ currForce: 1 })
        const c2 = makeCard({ currForce: 2 })
        placeCard(player, 'bf1', c1)
        placeCard(player, 'bf2', c2)
        const eff = makeEffect({ effect: "ad_mod", value: 2, target: "all_allies" })

        resolve(player, eff, game)

        expect(c1.currForce).toBe(3)
        expect(c2.currForce).toBe(4)
    })
})

// ─── draw ────────────────────────────────────────────────────────────────────

describe('resolveEffect - draw', () => {
    it('pioche des cartes', () => {
        const player = makeHero({
            library: [makeCard(), makeCard(), makeCard()],
            hand: []
        })
        const game = makeGame(player)
        const eff = makeEffect({ effect: "draw", value: 2, target: "self_hero" })

        resolve(player, eff, game, player)

        expect(player.hand.length).toBe(2)
        expect(player.library.length).toBe(1)
    })
})

// ─── freeze ──────────────────────────────────────────────────────────────────

describe('resolveEffect - freeze', () => {
    it('freeze une créature ciblée', () => {
        const player = makeHero()
        const game = makeGame(player)
        const creature = makeCard({ state: "ready" })
        const eff = makeEffect({ effect: "freeze", value: 0, target: "self" })

        resolve(player, eff, game, creature)

        expect(creature.state).toBe("sick")
    })

    it('freeze toutes les créatures ennemies', () => {
        const player = makeHero()
        const opponent = makeHero()
        const game = makeGame(player, opponent)
        const c1 = makeCard({ state: "ready" })
        const c2 = makeCard({ state: "ready" })
        placeCard(opponent, 'bf1', c1)
        placeCard(opponent, 'bf2', c2)
        const eff = makeEffect({ effect: "freeze", value: 0, target: "all_enemies" })

        resolve(player, eff, game)

        expect(c1.state).toBe("sick")
        expect(c2.state).toBe("sick")
    })
})

// ─── armor ───────────────────────────────────────────────────────────────────

describe('resolveEffect - armor', () => {
    it('ajoute de l\'armure au héros', () => {
        const player = makeHero({ armor: 2 })
        const game = makeGame(player)
        const eff = makeEffect({ effect: "armor", value: 3, target: "self_hero" })

        resolve(player, eff, game, player)

        expect(player.armor).toBe(5)
    })
})
// ──── building ───────────────────────────────────────────────────────────────────────────
describe('resolveBuildings - destroy random_enemies', () => {
    it('ne détruit quune seule créature ennemie', () => {
        const player = makeHero()
        const opponent = makeHero()
        const game = makeGame(player, opponent)
        
        const building = makeCard({ type: "building", effects: [{
            effect: "destroy",
            target: "random_enemies",
            targetType: { creature: true }
        }]})
        placeCard(player, 'bf1', building)
        
        const c1 = makeCard({ currEndurance: 5 })
        const c2 = makeCard({ currEndurance: 5 })
        placeCard(opponent, 'bf1', c1)
        placeCard(opponent, 'bf2', c2)

        resolveBuildings(game)

        const destroyed = [c1, c2].filter(c => c.currEndurance === 0)
        expect(destroyed.length).toBe(1) // exactement une seule
    })

    it('ne se détruit pas quand le board ennemi est vide', () => {
        const player = makeHero()
        const opponent = makeHero() // battlefield vide
        const game = makeGame(player, opponent)
        
        const building = makeCard({ currEndurance: 110, type: "building", effects: [{
            effect: "destroy",
            target: "random_enemies",
            targetType: { creature: true }
        }]})
        placeCard(player, 'bf1', building)

        resolveBuildings(game)

        expect(building.currEndurance).toBe(110) // toujours vivant
    })
})
// ─── win ────────────────────────────────────────────────────────────────────────────
describe('resolveEffect - win', () => {
    it('throw GameOver quand la cible est un héros', () => {
        const player = makeHero()
        const opponent = makeHero()
        const game = makeGame(player, opponent)
        const eff = makeEffect({ effect: "win", target: "self_hero" })

        expect(() => resolve(player, eff, game, player)).toThrow(GameOver)
    })

    it('throw GameOver avec le bon gagnant', () => {
        const player = makeHero()
        const opponent = makeHero()
        const game = makeGame(player, opponent)
        const eff = makeEffect({ effect: "win", target: "self_hero" })

        try {
            resolve(player, eff, game, player)
        } catch (e) {
            expect(e).toBeInstanceOf(GameOver)
            expect((e as GameOver).winner).toBe(player)
        }
    })

    it('ne throw pas si la cible est une carte', () => {
        const player = makeHero()
        const game = makeGame(player)
        const creature = makeCard()
        const eff = makeEffect({ effect: "win", target: "self" })

        expect(() => resolve(player, eff, game, creature)).not.toThrow()
    })
})

import type { Hero } from '../types/hero.ts'
import type { Card, CardClass, CardType, CreatureState } from '../types/card.ts'
import type { Game, WaitingPlayer } from '../types/gamesession.ts'
import type { Effect, EffectType, EffectTarget, EffectTime } from '../types/effects.ts'
import { Card as PrismaCard } from '@prisma/client'
import { prisma } from '../../prisma/prisma.ts'
import fs from 'fs'
import path from 'path'

function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

async function buildHero(heroId: string): Promise<Hero> {
    const hero = await prisma.hero.findUnique({ where: { id: heroId } })
    if (!hero) throw new Error('Héros introuvable')

    let passiveEffect: Effect[] = []
    if (hero.passive_json_path) {
        try {
            const fullPath = path.join(process.cwd(), 'databases', 'heroes', 'passives', hero.passive_json_path)
            if (fs.existsSync(fullPath)) {
                const json = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
                const effects = json.effects ?? [json];
                passiveEffect = effects.map((e: any) => ({
                    effect: e.effect as EffectType,
                    value: e.value ?? 0,
                    target: e.target as EffectTarget,
                    ...(e.timing && { timing: e.timing }),
                    ...(e.targetType && { targetType: e.targetType })
                }))
            }
        } catch (err) {
            console.error(`Erreur passif ${heroId}:`, err)
        }
    }
    // DEV MODE — remplacer par le vrai deck plus tard
    const allCards = await prisma.card.findMany()
    const library: Card[] = allCards.map((c: PrismaCard): Card => ({
        kind: 'card',
        idInGame: Math.floor(Math.random() * 100000),
        idInCollection: parseInt(c.id),
        cardName_en: c.name_en,
        cardName_fr: c.name_fr,
        cardName_sv: c.name_sv,
        effectText_en: c.effect_text_en ?? '',
        effectText_fr: c.effect_text_fr ?? '',
        effectText_sv: c.effect_text_sv ?? '',
        type: c.type_en as CardType,
        type_en: c.type_en,
        type_fr: c.type_fr,
        type_sv: c.type_sv,
        class: c.class as CardClass,
        runeCost: c.rune_cost,
        baseForce: c.force ?? 0,
        currForce: c.force ?? 0,
        baseEndurance: c.endurance ?? 0,
        currEndurance: c.endurance ?? 0,
        effect: c.effect,
        effects: (c.effect ? JSON.parse(c.effect).effects : []) as Effect[],
        zone: null as any,
        owner: null as any,
        timing: c.timing ?? 'end_of_turn' as EffectTime,
        state: 'alive' as CreatureState,
        fullPicPath: c.illustration ?? '',
        smallPicPath: c.illustration ?? '',
        cardBackPath: ''
    }))

    // PROD ONLY
// const cardIds: string[] = JSON.parse(hero.deck)
// const cards = (await Promise.all(
//     cardIds.map(id => prisma.card.findUnique({ where: { id } }))
// )).filter((c : PrismaCard | null): c is NonNullable<typeof c> => !!c)

// const library: Card[] = cards.map((c : PrismaCard): Card => ({
//     kind: 'card',
//     idInGame: Math.floor(Math.random() * 100000),
//     idInCollection: parseInt(c.id),
//     cardName: c.name,
//     effectText: c.effect_text ?? '',
//     type: c.type as CardType,
//     class: c.class as CardClass,
//     runeCost: c.rune_cost,
//     baseForce: c.force ?? 0,
//     currForce: c.force ?? 0,
//     baseEndurance: c.endurance ?? 0,
//     currEndurance: c.endurance ?? 0,
//     effect: c.effect,
//     effects: (c.effect ? JSON.parse(c.effect).effects : []) as Effect[],
//     zone: null as any,
//     owner: null as any,
//     timing: c.timing ?? 'end_of_turn' as EffectTime,
//     state: 'alive' as CreatureState,
//     fullPicPath: c.illustration ?? '',
//     smallPicPath: c.illustration ?? '',
//     cardBackPath: ''
// }))

//     shuffle(library);

    return {
        kind: 'hero',
        idInGame: Math.floor(Math.random() * 100000),
        class: hero.name as CardClass,
        passive: passiveEffect,
        armor: hero.base_armor,
        dmgDealt: 0,
        curRunes: 0,
        battlefield: {},
        library,
        graveyard: [],
        hand: [],
        heroPicPath: hero.illustration
    }
}

export async function instantiateGame(players: WaitingPlayer[]): Promise<Game> {
    const heroes = await Promise.all(players.map(p => buildHero(p.playerData.heroId)))

    heroes.forEach((hero, i) => {
        hero.username = players[i].playerData.username
        hero.userId = players[i].playerData.userId
    })

    
    for (const hero of heroes)
        for (const card of hero.library)
            card.owner = hero

    return {
        kind: 'game',
        phase: 'beginning',
        turnNumber: 1,
        clock_per_turn: 600,
        players: heroes,
        status: 'playing',
        winner: undefined,
        backgroundPath: 'default.png'
    }
}
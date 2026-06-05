import type { Hero } from '../types/hero.ts'
import type { Card, PlayCardPayload } from '../types/card.ts'
import type { Game } from '../types/gamesession.ts'
import type { BfZone } from '../types/zones.ts'
import type { Effect, EffectTime, EffectContext } from '../types/effects.ts'
import { playerDraw } from "./startTurn.ts";

export function dealsDmg(player1: Hero, player2: Hero, x: number): void {
    if (x <= player2.armor) {
        player2.armor -= x;  // l'armure absorbe tout
    } else {
        player1.dmgDealt += x - player2.armor;  // les dégâts dépassent l'armure
        player2.armor = 0;
    }
}

function resolveTiming(card: Card, timing: EffectTime, target: Hero, game: Game, emit?: (event: string, data: any) => void) {
    for (const effect of card.effects) {
        if (effect.timing === timing) {
            resolveEffect(card.owner, effect, { cardId: card.idInGame }, game, timing, target, undefined, undefined, emit)
        }
    }
}

export function resolveCombat(game: Game, emit?: (event: string, data: any) => void) {
    console.log("Résolution du combat...")
    for (let i = 1; i <= 8; i++) {
        const zone = `bf${i}` as BfZone;
        let card0 = game.players[0].battlefield[zone];
        let card1 = game.players[1].battlefield[zone];

        if (card0 && card0.type === "creature" && card0.state === "sick") card0 = undefined;
        if (card1 && card1.type === "creature" && card1.state === "sick") card1 = undefined;

        if (card0 === undefined) {
            if (card1 === undefined) continue;
            else if (card1.type === "creature") {
                dealsDmg(card1.owner, game.players[0], card1.currForce);
                emit?.('combat_event', { type: 'hit_hero', attackerId: card1.idInGame, targetPlayer: 0, value: card1.currForce, zone });
                resolveTiming(card1, "on_deal_damage", game.players[0], game, emit);
            }
        }
        else if (card1 === undefined) {
            if (card0.type === "creature") {
                dealsDmg(card0.owner, game.players[1], card0.currForce);
                emit?.('combat_event', { type: 'hit_hero', attackerId: card0.idInGame, targetPlayer: 1, value: card0.currForce, zone });
                resolveTiming(card0, "on_deal_damage", game.players[1], game, emit);
            }
        }
        else if (card0.type === "creature" && card1.type === "creature") {
            emit?.('combat_event', { type: 'zone_fight', card0Id: card0.idInGame, card1Id: card1.idInGame, zone });
            // card1 frappe card0
            if (card0.currEndurance - card1.currForce > 0) {
                card0.currEndurance -= card1.currForce;
                emit?.('combat_event', { type: 'card_damaged', cardId: card0.idInGame, value: card1.currForce, zone });
            } else {
                dealsDmg(card1.owner, game.players[0], card1.currForce - card0.currEndurance);
                emit?.('combat_event', { type: 'card_dies', cardId: card0.idInGame, attackerId: card1.idInGame, zone });
                emit?.('combat_event', { type: 'hit_hero', attackerId: card1.idInGame, targetPlayer: 0, value: card1.currForce - card0.currEndurance, zone });
                card0.currEndurance = 0;
                resolveTiming(card1, "on_deal_damage", game.players[0], game, emit);
            }

            // card0 frappe card1
            if (card1.currEndurance - card0.currForce > 0) {
                card1.currEndurance -= card0.currForce;
                emit?.('combat_event', { type: 'card_damaged', cardId: card1.idInGame, value: card0.currForce, zone });
            } else {
                dealsDmg(card0.owner, game.players[1], card0.currForce - card1.currEndurance);
                emit?.('combat_event', { type: 'card_dies', cardId: card1.idInGame, attackerId: card0.idInGame, zone });
                emit?.('combat_event', { type: 'hit_hero', attackerId: card0.idInGame, targetPlayer: 1, value: card0.currForce - card1.currEndurance, zone });
                card1.currEndurance = 0;
                resolveTiming(card0, "on_deal_damage", game.players[1], game, emit);
            }
        }
        else if (card0.type === "creature" && card1.type === "building") {
            card1.currEndurance -= card0.currForce;
            emit?.('combat_event', { type: 'card_damaged', cardId: card1.idInGame, value: card0.currForce, zone });
            if (card1.currEndurance <= 0)
                emit?.('combat_event', { type: 'card_dies', cardId: card1.idInGame, attackerId: card0.idInGame, zone });
        }
        else if (card0.type === "building" && card1.type === "creature") {
            card0.currEndurance -= card1.currForce;
            emit?.('combat_event', { type: 'card_damaged', cardId: card0.idInGame, value: card1.currForce, zone });
            if (card0.currEndurance <= 0)
                emit?.('combat_event', { type: 'card_dies', cardId: card0.idInGame, attackerId: card1.idInGame, zone });
        }
        else if (card1.type === "creature") {
            game.players[0].dmgDealt += card1.currForce;
            emit?.('combat_event', { type: 'hit_hero', attackerId: card1.idInGame, targetPlayer: 0, value: card1.currForce, zone });
        }
        else if (card0.type === "creature") {
            game.players[1].dmgDealt += card0.currForce;
            emit?.('combat_event', { type: 'hit_hero', attackerId: card0.idInGame, targetPlayer: 1, value: card0.currForce, zone });
        }
    }
}

export function resolveBuildings(game:Game, emit?: (event: string, data: any) => void) {
    console.log("Résolution des bâtiments...")
    for (let i = 1 ; i <= 8; i++)
    {
        const zone = `bf${i}` as BfZone;
        for (const player of game.players)
            {
            const building = player.battlefield[zone];
            if (building && building.type === "building") {
                for (const effect of building.effects) {
                    // pourquoi y a pas besoin de l'argument fromtiming ici ?
                    resolveEffect(player, effect, { cardId: building.idInGame }, game, "start_turn", undefined, undefined, undefined, emit);
                }
            }
        }
    }
}

function resolveValue(
    valueFrom: string | undefined,
    value: number | undefined,
    payload: PlayCardPayload,
    target?: Card | Hero,
    target2?: Card | Hero,
    context?: EffectContext
): number {
    if (valueFrom) {
        const parts = valueFrom.split('.');
        // context.targets[0].currForce → ['context', 'targets[0]', 'currForce']
        if (parts[0] === 'context' && parts[1]?.startsWith('targets[')) {
            const index = parseInt(parts[1].match(/\d+/)?.[0] ?? '0');
            const obj = context?.targets?.[index];
            if (!obj) return value ?? 0;
            const resolved = (obj as any)[parts[2]];
            return typeof resolved === 'number' ? resolved : value ?? 0;
        }

        const obj =
            parts[0] === 'target' ? target :
            parts[0] === 'target2' ? target2 :
            undefined;

        if (!obj) return value ?? 0;
        const resolved = (obj as any)[parts[1]];
        return typeof resolved === 'number' ? resolved : value ?? 0;
    }
    return value ?? 0;
}

function resolveTarget(player: Hero, eff: Effect, game: Game): Hero | Card | undefined {
    // Creatures placed this turn (sick) are protected from random targeting
    const isReady = (c: Card) => !(c.type === "creature" && c.state === "sick");

    let target: Hero | Card | undefined = undefined;
    if (eff.target === "self_hero") target = player;
    if (eff.target === "opponent_hero" && game) {
        target = game.players.find(p => p !== player) ?? undefined;
    }
    if (eff.target === "random_enemies" && game) {
        const opponents = game.players.filter(p => p !== player);
        let pool: (Card | Hero)[] = [];

        if (eff.targetType?.creature)
            pool.push(...opponents.flatMap(p => Object.values(p.battlefield).filter(c => c && c.type === "creature" && isReady(c)) as Card[]));
        if (eff.targetType?.building)
            pool.push(...opponents.flatMap(p => Object.values(p.battlefield).filter(c => c && c.type === "building") as Card[]));
        if (eff.targetType?.hero)
            pool.push(...opponents);

        if (pool.length > 0)
            target = pool[Math.floor(Math.random() * pool.length)];
    }
    else if (eff.target === "random_allies" && game) {
        let pool: (Card | Hero)[] = [];

        if (eff.targetType?.creature)
            pool.push(...Object.values(player.battlefield).filter(c => c && c.type === "creature" && isReady(c)) as Card[]);
        if (eff.targetType?.building)
            pool.push(...Object.values(player.battlefield).filter(c => c && c.type === "building") as Card[]);
        if (eff.targetType?.hero)
            pool.push(player);

        if (pool.length > 0)
            target = pool[Math.floor(Math.random() * pool.length)];
    }
    else if (eff.target === "random_all" && game) {
        let pool: (Card | Hero)[] = [];

        if (eff.targetType?.creature)
            pool.push(...game.players.flatMap(p => Object.values(p.battlefield).filter(c => c && c.type === "creature" && isReady(c)) as Card[]));
        if (eff.targetType?.building)
            pool.push(...game.players.flatMap(p => Object.values(p.battlefield).filter(c => c && c.type === "building") as Card[]));
        if (eff.targetType?.hero)
            pool.push(...game.players);

        if (pool.length > 0)
            target = pool[Math.floor(Math.random() * pool.length)];
    }
    return target;
}

export function resolveEffect(
    player: Hero,
    eff: Effect,
    payload: PlayCardPayload,
    game: Game,
    fromTiming?: EffectTime,
    target?: Card | Hero,
    target2?: Card | Hero,
    context?: EffectContext,
    emit?: (event: string, data: any) => void
): boolean {

    console.log("Resolving effect", { eff });
    if (eff.timing && eff.timing !== fromTiming) return true;

    target = resolveTarget(player, eff, game) ?? target;
    const noTargetNeeded = !!eff.target && (["all_enemies", "all_allies", "all_board"] as string[]).includes(eff.target);

    if (!target && !noTargetNeeded) return false;

    let value = resolveValue(eff.valueFrom, eff.value, payload, target, target2, context);

    // Gestion des cibles multiples
    if (eff.target === "all_enemies" || eff.target === "all_allies" || eff.target === "all_board") {
        const opponent = game.players.find(p => p !== player);
        let targets: Card[] = [];

        if (eff.target === "all_enemies" && opponent)
            targets = Object.values(opponent.battlefield).filter(Boolean) as Card[];
        else if (eff.target === "all_allies")
            targets = Object.values(player.battlefield).filter(Boolean) as Card[];
        else if (eff.target === "all_board")
            for (const p of game.players)
                targets.push(...Object.values(p.battlefield).filter(Boolean) as Card[]);

        if (eff.targetType) {
            targets = targets.filter(c => {
                if (c.type === "creature" && eff.targetType?.creature) return true;
                if (c.type === "building" && eff.targetType?.building) return true;
                return false;
            });
        }

        for (const t of targets)
            resolveEffect(player, { ...eff, target: undefined }, payload, game, fromTiming, t, target2, context, emit);

        return true;
    }

    target = target!;

    if (target.kind === "card" && eff.targetType) {
        const tt = eff.targetType;
        if (target.type === "creature" && !tt.creature) return false;
        if (target.type === "building" && !tt.building) return false;
    }
    if (target.kind === "hero" && eff.targetType && !eff.targetType.hero) return false;

    switch (eff.effect) {
        case "ad_mod":
            if (target.kind === "hero") return false;
            target.currForce += value;
            emit?.('effect_event', { type: 'ad_mod', targetId: target.idInGame, value });
            break;
        case "def_mod":
            if (target.kind === "hero") return false;
            target.currEndurance += value;
            emit?.('effect_event', { type: 'def_mod', targetId: target.idInGame, value });
            break;
        case "addef_mod":
            if (target.kind === "hero") return false;
            target.currForce += value;
            target.currEndurance += value;
            emit?.('effect_event', { type: 'addef_mod', targetId: target.idInGame, value });
            break;
        case "draw":
            if (target.kind === "card") return false;
            playerDraw(target, value);
            emit?.('effect_event', { type: 'draw', targetId: target.idInGame, value });
            break;
        case "dmg":
            if (target.kind === "hero") {
                dealsDmg(player, target, value);
                emit?.('effect_event', { type: 'dmg_hero', targetId: target.idInGame, value, sourceId: payload.cardId });
            } else {
                target.currEndurance -= value;
                emit?.('effect_event', { type: 'dmg_card', targetId: target.idInGame, value, sourceId: payload.cardId });
                if (target.currEndurance <= 0)
                    emit?.('effect_event', { type: 'destroy', targetId: target.idInGame, sourceId: payload.cardId });
            }
            break;
        case "armor":
            if (target.kind === "card") return false;
            target.armor += value;
            emit?.('effect_event', { type: 'armor', targetId: target.idInGame, value });
            break;
        case "runes":
            if (target.kind === "card") return false;
            target.curRunes += value;
            emit?.('effect_event', { type: 'runes', targetId: target.idInGame, value });
            break;
        case "swap":
            if (target.kind === "hero" || !target2 || target2.kind === "hero") return false; {
            const zone1 = target.zone as BfZone;
            const zone2 = target2.zone as BfZone;
            target.owner.battlefield[zone1] = target2;
            target2.owner.battlefield[zone2] = target;
            const tmpOwner = target.owner;
            target.owner = target2.owner;
            target2.owner = tmpOwner;
            target.zone = zone2;
            target2.zone = zone1;
            for (const p of (game as any).players)
                p.board = Object.values(p.battlefield).filter(Boolean);
            emit?.('effect_event', { type: 'swap', targetId: target.idInGame, target2Id: target2.idInGame });
            break;
        }
        case "destroy":
            if (target.kind === "hero") return false;
            target.currEndurance = 0;
            emit?.('effect_event', { type: 'destroy', targetId: target.idInGame });
            break;
        case "freeze":
            if (target.kind === "hero") return false;
            target.state = "sick";
            emit?.('effect_event', { type: 'freeze', targetId: target.idInGame });
            break;
        case "win":
            if (!target || target.kind !== "hero") return false;
            game.status = "game_over";
            game.winner = target as Hero;
            return true;
    }

    return true;
}
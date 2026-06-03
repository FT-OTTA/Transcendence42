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

function resolveTiming(card: Card, timing: EffectTime, target: Hero, game: Game) {
    for (const effect of card.effects) {
        if (effect.timing === timing) {
            resolveEffect(card.owner, effect, { cardId: card.idInGame }, game, timing, target)        }
    }
}

export function resolveCombat(game: Game) {
    console.log("Résolution du combat...")
    for (let i = 1; i <= 8 ; i++) {
        const zone = `bf${i}` as BfZone;
        let card0 = game.players[0].battlefield[zone];
        let card1 = game.players[1].battlefield[zone];
        if (card0 &&card0.type === "creature" && card0.state === "sick") {
            card0 = undefined;
        }
        if (card1 && card1.type === "creature" && card1.state === "sick") {
            card1 = undefined;
        }
        if (card0 === undefined) {
            if (card1 === undefined)
                continue;
            else if (card1.type === "creature"){
                dealsDmg(card1.owner, game.players[0], card1.currForce);
                resolveTiming(card1, "on_deal_damage", game.players[0], game);

            }

        }
        else if (card1 === undefined) {
            if (card0.type === "creature"){
                dealsDmg(card0.owner, game.players[1], card0.currForce);
                resolveTiming(card0, "on_deal_damage", game.players[1], game);

            }
        }
        else if (card0.type == "creature" && card1.type == "creature"){
            // 1 tabasse 0
            if (card0.currEndurance - card1.currForce > 0) {
                card0.currEndurance -= card1.currForce
            } else {
                dealsDmg(card1.owner, game.players[0], card1.currForce - card0.currEndurance);
                resolveTiming(card1, "on_deal_damage", game.players[0], game);
                card0.currEndurance = 0;  // ✅ la créature est morte
            }

            // 0 tabasse 1
            if (card1.currEndurance - card0.currForce > 0) {
                card1.currEndurance -= card0.currForce
            } else {
                dealsDmg(card0.owner, game.players[1], card0.currForce - card1.currEndurance);
                resolveTiming(card0, "on_deal_damage", game.players[1], game);
                card1.currEndurance = 0;  // ✅ la créature est morte
            }
        }
        else if (card0.type == "creature" && card1.type == "building") {
            // card0 attaque le building
            card1.currEndurance -= card0.currForce
        }
        else if (card0.type == "building" && card1.type == "creature") {
            // card1 attaque le building
            card0.currEndurance -= card1.currForce
        }


        else if (card1.type == "creature"){
            game.players[0].dmgDealt += card1.currForce
        }
        else if (card0.type == "creature"){
            game.players[1].dmgDealt += card0.currForce
        }
    }
}

export function resolveBuildings(game:Game) {
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
                    resolveEffect(player, effect, { cardId: building.idInGame }, game, "start_turn");
                }
            }
        }
    }
}
// function resolveValue(
//     valueFrom: string | undefined,
//     value: number | undefined,
//     payload: PlayCardPayload,
//     target?: Card | Hero,
//     target2?: Card | Hero
// ): number
// {
//     if (valueFrom)
//     {
//         const [source, field] = valueFrom.split('.');

//         const obj =
//             source === 'target' ? target :
//             source === 'target2' ? target2 :
//             undefined;

//         if (!obj)
//             return value ?? 0;

//         const resolved = (obj as any)[field];

//         return typeof resolved === 'number'
//             ? resolved
//             : value ?? 0;
//     }

//     return value ?? 0;
// }
// resolveValue
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
    let target: Hero | Card | undefined = undefined;
    if (eff.target === "self_hero") target = player;
    if (eff.target === "opponent_hero" && game) {
        target = game.players.find(p => p !== player) ?? undefined;
    }
    if (eff.target === "random_enemies" && game) {
        const opponents = game.players.filter(p => p !== player);
        let pool: (Card | Hero)[] = [];

        if (eff.targetType?.creature)
            pool.push(...opponents.flatMap(p => Object.values(p.battlefield).filter(c => c && c.type === "creature") as Card[]));
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
            pool.push(...Object.values(player.battlefield).filter(c => c && c.type === "creature") as Card[]);
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
            pool.push(...game.players.flatMap(p => Object.values(p.battlefield).filter(c => c && c.type === "creature") as Card[]));
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
    context?: EffectContext
    ): boolean {

    console.log("Resolving effect", { eff });
    if (eff.timing && eff.timing !== fromTiming) return true;
    
    // Override target selon l'effet
    target = resolveTarget(player, eff, game) ?? target;
    const noTargetNeeded = !!eff.target && (["all_enemies", "all_allies", "all_board"] as string[]).includes(eff.target)
    
    if (!target && !noTargetNeeded) return false;

    let value = resolveValue(eff.valueFrom, eff.value, payload, target, target2, context);
    console.log("Resolved value:", value, "from", eff.valueFrom);
    console.log("target avant switch:", target?.kind, "noTargetNeeded:", noTargetNeeded)

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

        // Filtre par targetType si défini
        if (eff.targetType) {
            targets = targets.filter(c => {
                if (c.type === "creature" && eff.targetType?.creature) return true;
                if (c.type === "building" && eff.targetType?.building) return true;
                return false;
            });
        }

        for (const t of targets)
            resolveEffect(player, { ...eff, target: undefined }, payload, game, fromTiming, t, target2, context);

        return true;
    }

    target = target!;

    // Filtre targetType pour cible unique
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
            break;
        case "def_mod":
            if (target.kind === "hero") return false;
            target.currEndurance += value;
            break;
        case "addef_mod":
            if (target.kind === "hero") return false;
            target.currForce += value;
            target.currEndurance += value;
            break;
        case "draw":
            if (target.kind === "card") return false;
            playerDraw(target, value);
            break;
        case "dmg":
            if (target.kind === "hero")
                dealsDmg(player, target, value);
            else
                target.currEndurance -= value;
            break;
        case "armor":
            if (target.kind === "card") return false;
            target.armor += value;
            break;
        case "runes":
            if (target.kind === "card") return false;
            target.curRunes += value;
            break;
        case "swap": {
            if (target.kind === "hero" || !target2 || target2.kind === "hero") return false;
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
            break;
        }
        case "destroy":
            if (target.kind === "hero") return false;
            target.currEndurance = 0;
            break;
        case "freeze":
            if (target.kind === "hero") return false;
            target.state = "sick";
            break;
        case "win":
            if (!target || target.kind !== "hero") return false;
            game.status = "game_over";
            game.winner = target as Hero;
            return true;
    }

    return true;
}
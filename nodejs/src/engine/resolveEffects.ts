import type { Hero } from '../types/hero.ts'
import type { Card, PlayCardPayload } from '../types/card.ts'
import type { Game } from '../types/gamesession.ts'
import type { BfZone } from '../types/zones.ts'
import type { Effect, EffectTrigger } from '../types/effects.ts'
import { playerDraw } from "./startTurn.ts";

export function dealsDmg(player1: Hero, player2: Hero, x: number): void {
    if (x <= player2.armor) {
        player2.armor -= x;  // l'armure absorbe tout
    } else {
        player1.dmgDealt += x - player2.armor;  // les dégâts dépassent l'armure
        player2.armor = 0;
    }
}

function resolveTriggers(card: Card, trigger: EffectTrigger, target: Hero, game: Game) {
    for (const effect of card.effects) {
        if (effect.trigger === trigger) {
            resolveEffect(card.owner, effect, { cardId: card.idInGame, target }, game)
        }
    }
}

export function resolveCombat(game: Game) {
    console.log("Résolution du combat...")
    for (let i = 1; i <= 8 ; i++) {
        const zone = `bf${i}` as BfZone;
        const card0 = game.players[0].battlefield[zone];
        const card1 = game.players[1].battlefield[zone];
        if (card0 === undefined) {
            if (card1 === undefined)
                continue;
            else if (card1.type === "creature"){
                dealsDmg(card1.owner, game.players[0], card1.currForce);
                resolveTriggers(card1, "on_deal_damage", game.players[0], game);

            }

        }
        else if (card1 === undefined) {
            if (card0.type === "creature"){
                dealsDmg(card0.owner, game.players[1], card0.currForce);
                resolveTriggers(card0, "on_deal_damage", game.players[1], game);

            }
        }
        else if (card0.type == "creature" && card1.type == "creature"){
            // 1 tabasse 0
            if (card0.currEndurance - card1.currForce > 0) {
                card0.currEndurance -= card1.currForce
            } else {
                dealsDmg(card1.owner, game.players[0], card1.currForce - card0.currEndurance);
                resolveTriggers(card1, "on_deal_damage", game.players[0], game);
                card0.currEndurance = 0;  // ✅ la créature est morte
            }

            // 0 tabasse 1
            if (card1.currEndurance - card0.currForce > 0) {
                card1.currEndurance -= card0.currForce
            } else {
                dealsDmg(card0.owner, game.players[1], card0.currForce - card1.currEndurance);
                resolveTriggers(card0, "on_deal_damage", game.players[1], game);
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
                    resolveEffect(player, effect, { cardId: building.idInGame }, game);
                }
            }
        }
    }
}

function resolveValue(valueFrom: string | undefined, value: number | undefined, payload: PlayCardPayload): number {
    if (!value) return 0;
    if (!valueFrom) return value;

    const [source, field] = valueFrom.split('.');
    const obj = source === 'target' ? payload.target
              : source === 'target2' ? payload.target2
              : undefined;

    if (!obj) return value;
    return (obj as any)[field] ?? value;
}

export class GameOver extends Error {
    constructor(public winner: Hero) {
        super('game_over')
    }
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
            pool.push(...opponents.flatMap(p => Object.values(p.battlefield).filter(Boolean) as Card[]));
        if (eff.targetType?.hero)
            pool.push(...opponents);

        if (pool.length > 0)
            target = pool[Math.floor(Math.random() * pool.length)];
    }
    else if (eff.target === "random_allies" && game) {
        let pool: (Card | Hero)[] = [];

        if (eff.targetType?.creature)
            pool.push(...Object.values(player.battlefield).filter(Boolean) as Card[]);
        if (eff.targetType?.hero)
            pool.push(player);

        if (pool.length > 0)
            target = pool[Math.floor(Math.random() * pool.length)];
    }
    else if (eff.target === "random_all" && game) {
        let pool: (Card | Hero)[] = [];

        if (eff.targetType?.creature)
            pool.push(...game.players.flatMap(p => Object.values(p.battlefield).filter(Boolean) as Card[]));
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
    game: Game): boolean {

    console.log("Resolving effect", { eff });
    let target = payload.target;
    let target2 = payload.target2;

    // Override target selon l'effet
    target = resolveTarget(player, eff, game) ?? target;
    const noTargetNeeded = !!eff.target && (["all_enemies", "all_allies", "all_board"] as string[]).includes(eff.target)
    
    if (!target && !noTargetNeeded) return false;
    target = target!;


    let value = resolveValue(eff.valueFrom, eff.value, payload);
    switch (eff.effect) {
        case "ad_mod":
            if (eff.target === "all_enemies" && game) {
                const opponent = game.players.find(p => p !== player);
                if (opponent) Object.values(opponent.battlefield).forEach(c => { if (c) c.currForce += value });
                return true;
            }
            else if (eff.target === "all_allies" && game) {
                Object.values(player.battlefield).forEach(c => { if (c) c.currForce += value });
                return true;
            }
            else if (eff.target === "all_board" && game) {
                for (const p of game.players){
                    for (const c of Object.values(p.battlefield))
                        if (c) c.currForce += value;
                }
                return true;
            }
            else if (target.kind === "hero")
                return false;
            else
                target.currForce += value;
            break;
        case "def_mod":
            if (eff.target === "all_enemies" && game) {
                const opponent = game.players.find(p => p !== player);
                if (opponent) Object.values(opponent.battlefield).forEach(c => { if (c) c.currEndurance += value });
            }
            else if (eff.target === "all_allies" && game) {
                Object.values(player.battlefield).forEach(c => { if (c) c.currEndurance += value });
            }
            else if (eff.target === "all_board" && game) {
                for (const p of game.players){
                    for (const c of Object.values(p.battlefield))
                        if (c) c.currEndurance += value;
                }
            }
            else if (target.kind === "hero")
                return false;
            else
                target.currEndurance += value;
            break;
        case "addef_mod":
            if (eff.target === "all_enemies" && game) {
                const opponent = game.players.find(p => p !== player);
                if (opponent)
                    Object.values(opponent.battlefield).forEach(c => {
                    if (c) {
                        c.currForce += value;
                        c.currEndurance += value;
                    }
                    });
            }
            else if (eff.target === "all_allies" && game) {
                Object.values(player.battlefield).forEach(c => {
                    if (c) {
                        c.currForce += value;
                        c.currEndurance += value }
                });
            }
            else if (eff.target === "all_board" && game) {
                for (const p of game.players){
                    for (const c of Object.values(p.battlefield))
                        if (c){
                            c.currForce += value;
                            c.currEndurance += value
                        }
                }
            }
            else if (target.kind === "hero")
                return false;
            else {
                target.currForce += value;
                target.currEndurance += value;
            }
            break;
        case "draw":
            if (target.kind === "card")
                return false;
            playerDraw(target, value);
            break;
        case "dmg":
            if (eff.target === "all_enemies" && game) {
                const opponent = game.players.find(p => p !== player);
                if (opponent) Object.values(opponent.battlefield).forEach(c => { if (c) c.currEndurance -= value });
            }
            else if (eff.target === "all_allies" && game) {
                Object.values(player.battlefield).forEach(c => { if (c) c.currEndurance -= value });
            }
            else if (eff.target === "all_board" && game) {
                for (const p of game.players){
                    for (const c of Object.values(p.battlefield))
                        if (c) c.currEndurance -= value;
                }
                return true;
            }
            else if (target.kind === "hero")
                dealsDmg(player, target, value);
            else if (target.kind === "card")
                target.currEndurance -= value;

            break;
        case "armor":
            if (target.kind === "card")
                return false;
            target.armor += value;
            break;
        case "runes":
            if (target.kind === "card")
                return false;
            target.curRunes += value;
            break;
        case "swap":
            if (target.kind === "hero" || !target2)
                return false;
            {
                const tmp = target.zone;
                target.zone = target2.zone;
                target2.zone = tmp;
            }
            break;
        case "destroy":
            if (eff.target === "all_enemies" && game) {
                const opponent = game.players.find(p => p !== player);
                if (opponent) Object.values(opponent.battlefield).forEach(c => { if (c) c.currEndurance = 0 });
                return true;
            }
            else if (eff.target === "all_allies" && game) {
                Object.values(player.battlefield).forEach(c => { if (c) c.currEndurance = 0 });
                return true;
            }
            else if (eff.target === "all_board" && game) {
                for (const p of game.players){
                    for (const c of Object.values(p.battlefield))
                        if (c) c.currEndurance = 0;
                }
            }
            else if (target.kind === "hero")
                return false;
            else
                target.currEndurance = 0;
            break;
        case "freeze":
            if (eff.target === "all_enemies" && game) {
                const opponent = game.players.find(p => p !== player);
                if (opponent) Object.values(opponent.battlefield).forEach(c => { if (c) c.state = "sick" });
                return true;
            }
            else if (eff.target === "all_allies" && game) {
                Object.values(player.battlefield).forEach(c => { if (c) c.state = "sick" });
                return true;
            }
            else if (eff.target === "all_board" && game) {
                for (const p of game.players){
                    for (const c of Object.values(p.battlefield))
                        if (c) c.state = "sick";
                }
            }
            else if (target.kind === "hero")
                return false;
            else
                target.state = "sick";
            break;
        case "win":
            if (target.kind === "card") return false;
            throw new GameOver(target as Hero);

    }

    return true;
}
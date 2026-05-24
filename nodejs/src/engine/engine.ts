import type { Hero } from '../types/hero.ts'
import type { Card, PlayCardPayload } from '../types/card.ts'
import type { Game } from '../types/gamesession.ts'
import type { Zone, BfZone } from '../types/zones.ts'
import type { Effect, EffectTrigger } from '../types/effects.ts'

export function fibonacci(n: number): number {
    if (n === 0 || n === 1)
        return 1;
    return fibonacci(n - 1) + fibonacci(n - 2)
}

export function playerDraw(player: Hero, n: number): boolean {
    while (player.library.length > 0 && n--)
        player.hand.push(player.library.pop()!);
    if (player.library.length === 0)
        return (false);
    return (true);
}

export function startTurn(game: Game): void {
    for (const player of game.players) {
        player.curRunes = fibonacci(game.turnNumber);
        player.curRunes = 999; // remove this line to have normal rune gain
        playerDraw(player, 50 - player.hand.length);// remove this line to have normal hand refill
        // playerDraw(player, 8 - player.hand.length); 
        resolveEffect(player, player.passive, { cardId: 0, target: player }, game);
        resolveBuildings(game);
        checkBoardState(game);
    }
}

export function playCard(card: Card, payload: PlayCardPayload, game: Game): void {
    // console.log("Playing card", { card, payload });
    // console.log("zone reçue:", payload.zone)
    // console.log("starts with bf:", payload.zone?.startsWith("bf"))

    if (card.owner.curRunes < card.runeCost)
        return;
    card.owner.curRunes -= card.runeCost;
    card.owner.hand = card.owner.hand.filter(c => c.idInGame !== card.idInGame);


    if (card.type == "building" || card.type == "creature")
    {
        if (payload.zone && payload.zone.startsWith("bf"))
        {
            card.zone = payload.zone;
            card.owner.battlefield[payload.zone as BfZone] = card;
        }
    }

    if (card.type !== "building") // may be change later if we want to have building with immediate effects
    {
        for (const effect of card.effects) {
            resolveEffect(card.owner, effect, payload, game)
            // if (!resolveEffect(card.owner, effect, payload))
                // console.log("Resolve effect failed", { cardId: card.idInGame, effect: effect.effect, payload });
        }

    }
}
// p1 deals to p2
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
    for (let i = 1 ; i <= 8; i++)
    {
        const zone = `bf${i}` as BfZone;
        for (const player of game.players)
            {
            const building = player.battlefield[zone];
            if (building && building.type === "building") {
                for (const effect of building.effects){
                    switch (effect.target) {
                        case "self_hero":
                            resolveEffect(player, effect, { cardId: 0, target: player }, game);
                            break;
                        case "opponent_hero":
                            for (const oppo of game.players)
                            {
                                if (oppo !== player)
                                    resolveEffect(player, effect, { cardId: 0, target: oppo }, game);
                            }
                            break;
                        case "self":
                            resolveEffect(player, effect, { cardId: building.idInGame, target: building }, game);
                            break;
                        case "left_neighbor":
                            if (i === 1)
                                break;
                            const zoneLeftTarget = `bf${i - 1}` as BfZone;
                            const leftTarget = player.battlefield[zoneLeftTarget];
                            if (leftTarget)
                                resolveEffect(player, effect, { cardId: building.idInGame, target: leftTarget }, game);
                            break;
                        case "right_neighbor":
                            if (i === 8)
                                break;
                            const zoneRightTarget = `bf${i + 1}` as BfZone;
                            const rightTarget = player.battlefield[zoneRightTarget];
                            if (rightTarget)
                                resolveEffect(player, effect, { cardId: building.idInGame, target: rightTarget }, game);
                            break;
                        case "all_allies":
                            for (let j = 1 ; j <= 8; j++)
                            {
                                if (j === i)
                                    continue;
                                const nezo = `bf${j}` as BfZone;
                                const ally = player.battlefield[nezo];
                                if (ally)
                                    resolveEffect(player, effect, { cardId: building.idInGame, target: ally }, game);
                            }
                            break;
                        case "all_enemies":
                            for (let j = 1 ; j <= 8; j++)
                            {
                                const enemyBf = `bf${j}` as BfZone;
                                for (const oppo of game.players){
                                    if (oppo === player)
                                        continue;
                                    const enemy = oppo.battlefield[enemyBf];
                                    if (enemy)
                                        resolveEffect(oppo, effect, { cardId: building.idInGame, target: enemy }, game);
                                }
                            }
                            break;
                    }
                }
            }
        }
    }
}

function resolveValue(valueFrom: string | undefined, value: number, payload: PlayCardPayload): number {
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

export function resolveEffect(
    player: Hero,
    eff: Effect,
    payload: PlayCardPayload,
    game: Game): boolean {

    console.log("Resolving effect", { player: player.class, effect: eff.effect, payload });
    let target = payload.target;
    let target2 = payload.target2;
    // Override target selon l'effet
    if (eff.target === "self_hero") target = player;
    
    if (!target) return false;
    let value = resolveValue(eff.valueFrom, eff.value, payload);
    switch (eff.effect) {
        case "ad_mod":
            if (target.kind === "hero")
                return false;
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
            else
                target.currForce += value;
            break;
        case "def_mod":
            if (target.kind === "hero")
                return false;
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
            else
                target.currEndurance += value;
            break;
        case "addef_mod":
            if (target.kind === "hero")
                return false;
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
            if (target.kind === "hero")
                dealsDmg(player, target, value);
            else if (target.kind === "card")
                target.currEndurance -= value;
            else if (eff.target === "all_enemies" && game) {
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
            if (!target2)
                return false;
            if (target.kind === "hero" || target2 === undefined)
                return false;
            const tmp = target.zone;
            target.zone = target2.zone;
            target2.zone = tmp;
            break;
        case "destroy":
            if (target.kind === "hero")
                return false;
            else if (eff.target === "all_enemies" && game) {
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
            target.currEndurance = 0;
            break;
        case "freeze":
            if (target.kind === "hero")
                return false;
            else if (eff.target === "all_enemies" && game) {
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
            else
                target.state = "sick";
            break;
        case "win":
            if (target.kind === "card") return false;
            throw new GameOver(target as Hero);

    }

    return true;
}

export function checkVictory(game: Game): Hero | null {
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

export function checkBoardState(game: Game) {
    for (let i = 1 ; i<= 8 ; i++) {
        const zone = `bf${i}` as BfZone;
        for (const player of game.players) {
            const card = player.battlefield[zone];
            if (card && card.currEndurance <= 0) {
                card.zone = "graveyard";
                player.battlefield[zone] = undefined;
            }
        }
    }
}

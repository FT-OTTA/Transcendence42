import type { Card, PlayCardPayload } from '../types/card.ts'
import { EffectContext, EffectTime } from '../types/effects.ts';
import type { Game } from '../types/gamesession.ts'
import { Hero } from '../types/hero.ts';
import type { BfZone } from '../types/zones.ts'
import { resolveEffect } from "./resolveEffects.ts";
import { findById } from './utils.ts'


export function playCard(card: Card,
    payload: PlayCardPayload,
    game: Game,
    timing: EffectTime): void {
    // console.log("Playing card", { card, payload });
    // console.log("zone reçue:", payload.zone)
    // console.log("starts with bf:", payload.zone?.startsWith("bf"))

    card.owner.hand = card.owner.hand.filter(c => c.idInGame !== card.idInGame);


    if (card.type === "building" || card.type === "creature")
    {
        if (payload.zone && payload.zone.startsWith("bf"))
        {
            card.zone = payload.zone;
            card.owner.battlefield[payload.zone as BfZone] = card;
        }
        if (card.type === "creature") {
            card.state = "sick";
        }
    }

    if (card.type !== "building") {
        for (let i = 0; i < card.effects.length; i++) {
            const effect = card.effects[i];
            const needsTwo = effect.effect === "swap";

            let target, target2;

            if (needsTwo) {
                // Les deux cibles sont dans targets[0] et targets[1]
                const t1 = payload.targets?.[0];
                const t2 = payload.targets?.[1];
                target = t1?.targetId ? findById(game, t1.targetId) : undefined;
                target2 = t2?.targetId ? findById(game, t2.targetId) as Card : undefined;
            } else {
                const t = payload.targets?.[i];
                target = t?.targetId ? findById(game, t.targetId) : undefined;
                target2 = undefined;
            }
            const context: EffectContext = {
                targets: (payload.targets ?? [])
                    .map(t => t?.targetId ? findById(game, t.targetId) : undefined)
                    .filter(Boolean) as (Card | Hero)[]
            };

            
            console.log("Resolving effect", { effect, target, target2 ,context });
            resolveEffect(card.owner, effect, payload, game, timing, target, target2, context);
        }
    }
}

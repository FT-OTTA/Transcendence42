import type { Card, PlayCardPayload } from '../types/card.ts'
import type { Game } from '../types/gamesession.ts'
import type { BfZone } from '../types/zones.ts'
import { resolveEffect } from "./resolveEffects.ts";
import { findById } from './utils.ts'

export function playCard(card: Card, payload: PlayCardPayload, game: Game): void {
    // console.log("Playing card", { card, payload });
    // console.log("zone reçue:", payload.zone)
    // console.log("starts with bf:", payload.zone?.startsWith("bf"))

    card.owner.hand = card.owner.hand.filter(c => c.idInGame !== card.idInGame);


    if (card.type == "building" || card.type == "creature")
    {
        if (payload.zone && payload.zone.startsWith("bf"))
        {
            card.zone = payload.zone;
            card.owner.battlefield[payload.zone as BfZone] = card;
        }
    }

    if (card.type !== "building") {
        for (let i = 0; i < card.effects.length; i++) {
            const t = payload.targets?.[i]
            const target = t?.targetId ? findById(game, t.targetId) : undefined
            const target2 = t?.target2Id ? findById(game, t.target2Id) as Card : undefined
            resolveEffect(card.owner, card.effects[i], payload, game, undefined, target, target2)        }

    }
}

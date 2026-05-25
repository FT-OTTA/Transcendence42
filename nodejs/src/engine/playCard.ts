import type { Card, PlayCardPayload } from '../types/card.ts'
import type { Game } from '../types/gamesession.ts'
import type { BfZone } from '../types/zones.ts'
import { resolveEffect } from "./resolveEffects.ts";

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
            console.log("Resolving effect", { effect: effect.effect });
            resolveEffect(card.owner, effect, payload, game)
            // if (!resolveEffect(card.owner, effect, payload))
                // console.log("Resolve effect failed", { cardId: card.idInGame, effect: effect.effect, payload });
        }

    }
}

import { useState } from 'react';
import type { Card } from 'otta-shared-types/card';
import type { Hero } from 'otta-shared-types/hero';

export function getTargetCountForEffect(effect: any): number {
    if (effect.effect === "swap") return 2;
    if (typeof effect.target !== "string") return 0;
    if (["self", "opponent", "all"].includes(effect.target)) return 1;
    return 0;
}

export function getRequiredTargetCount(card: Card): number {
    return Array.isArray(card.effects)
        ? card.effects.reduce((count: number, e: any) => count + getTargetCountForEffect(e), 0)
        : 0;
}

function getNextEffectIndex(card: Card, targets: Array<{ target: Card | Hero; effectIndex: number }>): number {
    const effects = card.effects;
    let i = 0;
    while (i < effects.length) {
        const required = getTargetCountForEffect(effects[i]);
        const selectedCount = targets.filter(t => t.effectIndex === i).length;
        if (selectedCount < required) return i;
        i++;
    }
    return effects.length;
}

const AUTO_TARGETS = ["self_hero","opponent_hero","left_neighbor","right_neighbor",
    "all_allies","all_enemies","all_board","random_enemies","random_allies","random_all"];

export function useTargeting(
    playerSlots: (Card | null)[],
    opponentSlots: (Card | null)[],
    game: any,
    myPlayerIndexRef: React.MutableRefObject<number | null>
) {
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [selectedTargets, setSelectedTargets] = useState<Array<{ target: Card | Hero; effectIndex: number }>>([]);
    const [potentialTargets, setPotentialTargets] = useState<(Card | Hero)[]>([]);
    const [pendingSlots, setPendingSlots] = useState<(Card | null)[]>(Array(8).fill(null));
    const [pendingSlotIndex, setPendingSlotIndex] = useState<number | null>(null);
    const [currentEffectIndex, setCurrentEffectIndex] = useState(0);

    function getTargets(effectIndex: number = 0, card: Card | null = selectedCard) {
        if (!card) return;
        const ef = card.effects;
        if (effectIndex >= ef.length) { setPotentialTargets([]); return; }
        const e = ef[effectIndex];

        if (typeof e.target === "string" && AUTO_TARGETS.includes(e.target)) {
            getTargets(effectIndex + 1, card);
            return;
        }

        const selectedForEffect = selectedTargets.filter(t => t.effectIndex === effectIndex).length;
        const requiredForEffect = getTargetCountForEffect(e);
        if (requiredForEffect === 0 || selectedForEffect >= requiredForEffect) {
            getTargets(effectIndex + 1, card);
            return;
        }

        let pool: (Card | Hero)[] = [];
        if (e.target === "self") pool = playerSlots.filter(Boolean) as Card[];
        else if (e.target === "opponent") pool = opponentSlots.filter(Boolean) as Card[];
        else if (e.target === "all") pool = [...playerSlots, ...opponentSlots].filter(Boolean) as Card[];

        if (e.targetType?.hero && myPlayerIndexRef.current !== null) {
            if (e.target === "opponent") pool.push(game.players[1 - myPlayerIndexRef.current]);
            else if (e.target === "self") pool.push(game.players[myPlayerIndexRef.current]);
            else if (e.target === "all") pool.push(...game.players);
        }

        if (!e.targetType?.creature) pool = pool.filter(c => !('type' in c) || c.type !== "creature");
        if (!e.targetType?.building) pool = pool.filter(c => !('type' in c) || c.type !== "building");

        setPotentialTargets(pool);
        setCurrentEffectIndex(effectIndex);
    }

    function pushSelectedTarget(target: Card | Hero) {
        if (!selectedCard) return;
        const existingIndex = selectedTargets.findIndex(st => st.target.idInGame === target.idInGame);
        if (existingIndex !== -1) {
            const next = [...selectedTargets];
            next.splice(existingIndex, 1);
            setSelectedTargets(next);
            getTargets(getNextEffectIndex(selectedCard, next), selectedCard);
            return;
        }
        if (!potentialTargets.some(c => c.idInGame === target.idInGame)) return;
        const next = [...selectedTargets, { target, effectIndex: currentEffectIndex }];
        setSelectedTargets(next);
        const selectedForEffect = next.filter(st => st.effectIndex === currentEffectIndex).length;
        const requiredForEffect = getTargetCountForEffect(selectedCard.effects[currentEffectIndex]);
        const nextIdx = selectedForEffect >= requiredForEffect
            ? getNextEffectIndex(selectedCard, next)
            : currentEffectIndex;
        getTargets(nextIdx, selectedCard);
    }

    function abortPlay() {
        setPendingSlots(prev => {
            const next = [...prev];
            if (pendingSlotIndex !== null) next[pendingSlotIndex] = null;
            return next;
        });
        setSelectedCard(null);
        setPendingSlotIndex(null);
        setSelectedTargets([]);
        setPotentialTargets([]);
    }

    function resetAfterPlay() {
        setSelectedCard(null);
        setSelectedTargets([]);
        setPotentialTargets([]);
        setPendingSlotIndex(null);
        setCurrentEffectIndex(0);
    }

    return {
        selectedCard, setSelectedCard,
        selectedTargets, potentialTargets,
        pendingSlots, setPendingSlots,
        pendingSlotIndex, setPendingSlotIndex,
        currentEffectIndex,
        getTargets, pushSelectedTarget, abortPlay, resetAfterPlay,
    };
}

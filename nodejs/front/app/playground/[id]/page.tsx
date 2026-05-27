"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import Navbar from '../../components/navigation/Navbar';
import HeroSelection from '../../components/playground/HeroSelection';
import OpponentBoard from '../../components/playground/OpponentBoard';
import PlayerBoard from '../../components/playground/PlayerBoard';
import PlayerHand from '../../components/playground/PlayerHand';
import GameStats from '../../components/playground/GameStats';
import ConfirmPlay from '../../components/playground/ConfirmPlay';
import type { Card } from '../../types/card';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';
import LargeCardView from '@/app/components/playground/LargeCardView';
import { Hero } from '../../types/hero';

export default function PlaygroundPage() {
  const { id } = useParams();
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<Array<{ target: Card | Hero; effectIndex: number }>>([]);
  const [potentialTargets, setPotentialTargets] = useState<(Card | Hero)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [runeError, setRuneError] = useState<string | null>(null);
  const [hand, setHand] = useState<(Card | null)[]>(Array(8).fill(null));
  const [playerSlots, setPlayerSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [opponentSlots, setOpponentSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [runes, setRunes] = useState(100);
  const [meStats, setMeStats] = useState<any>(null);
  const [opponentStats, setOpponentStats] = useState<any>(null);
  const [turnNumber, setTurnNumber] = useState(1);
  const [pendingSlots, setPendingSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [pendingSlotIndex, setPendingSlotIndex] = useState<number | null>(null); // Pour mémoriser le slot ciblé lors du play d'une créature
  const [currentEffectIndex, setCurrentEffectIndex] = useState<number>(0);

  const myPlayerIndexRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!selectedHero) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => console.log('Socket connected ✅', newSocket.id));
    newSocket.on('connect_error', (err) => console.error('Socket error ❌', err));    socketRef.current = newSocket;
    setSocket(newSocket);

    const battlefieldToSlots = (battlefield: any) => {
        const slots = Array(8).fill(null);
        for (let i = 1; i <= 8; i++) {
            slots[i - 1] = battlefield[`bf${i}`] ?? null;
        }
        return slots;
    };

    newSocket.on('connect', () => {
        newSocket.emit('join_game', { heroId: selectedHero });
    });

    newSocket.on('turn_start', (data) => {
        if (myPlayerIndexRef.current === null) return;
        const me = data.game.players[myPlayerIndexRef.current];
        const opponent = data.game.players[1 - myPlayerIndexRef.current];
        setPendingSlots(Array(8).fill(null));
        setGame(data.game);
        setMeStats(me);
        setOpponentStats(opponent);
        setTurnNumber(data.game.turnNumber);
        setHand(me.hand);
        setRunes(me.curRunes);
        setPlayerSlots(battlefieldToSlots(me.battlefield));
        setOpponentSlots(battlefieldToSlots(opponent.battlefield));
    });

    newSocket.on('game_over', (data) => {
        if (-1 === data.winner) {
          alert("Game over! It's a draw!");
        } else {
          alert(`Game over! Winner: ${data.winner === myPlayerIndexRef.current ? "You" : "Opponent"}`);
        }
        setSelectedHero(null);
        setGame(null);
        setHand(Array(8).fill(null));
        setPlayerSlots(Array(8).fill(null));
        setOpponentSlots(Array(8).fill(null));
        setRunes(0);
        setMeStats(null);
        setOpponentStats(null);
        setTurnNumber(1);
    });

    newSocket.on('game_start', (data) => {
        myPlayerIndexRef.current = data.playerIndex;
        const me = data.game.players[data.playerIndex];
        const opponent = data.game.players[1 - data.playerIndex];
        setGame(data.game);
        setMeStats(me);
        setOpponentStats(opponent);
        setTurnNumber(data.game.turnNumber);
        setHand(me.hand);
        setRunes(me.curRunes);
        setPlayerSlots(battlefieldToSlots(me.battlefield));
        setOpponentSlots(battlefieldToSlots(opponent.battlefield));
        setIsLoading(false);
    });

    newSocket.on('game_update', (data) => {
        if (myPlayerIndexRef.current === null) return;
        const me = data.game.players[myPlayerIndexRef.current];
        const opponent = data.game.players[1 - myPlayerIndexRef.current];
        setGame(data.game);
        setMeStats(me);
        setOpponentStats(opponent);
        setTurnNumber(data.game.turnNumber);
        setHand(me.hand);
        setRunes(me.curRunes);
        setPlayerSlots(battlefieldToSlots(me.battlefield));
        setOpponentSlots(battlefieldToSlots(opponent.battlefield));
    });

    return () => { newSocket.disconnect(); };
  }, [selectedHero]);

  const playerHandCards = useMemo(() => hand, [hand]);
  const displaySlots = playerSlots.map((card, i) => card ?? pendingSlots[i]);

  function handlePlaySpell() {
      if (!selectedCard || selectedCard.type !== "spell") return;

      // 1. Vérification des runes
      if (selectedCard.runeCost > runes) {
          setRuneError("Not enough runes!");
          return;
      }

      // 2. Vérification si le sort nécessite des cibles
      const ef = Array.isArray(selectedCard.effects) ? selectedCard.effects : [];
      const needsTarget = ef.some((e: any) => e.target === "opponent" || e.target === "self");

      // Si le sort n'a pas besoin de cible, on l'émet immédiatement
      if (!needsTarget) {
          socketRef.current?.emit('play_card', {
              cardId: selectedCard.idInGame,
              zone: null, // Pas de zone pour un sort
              targetId: null,
              target2Id: null,
          });
          setSelectedCard(null);
      } else {
          // Sinon, on lance la phase de ciblage (ton code existant)
          getTargets();
      }
  }
function handleConfirmSpell() {
    if (!selectedCard) return;

    socketRef.current?.emit('play_card', {
        cardId: selectedCard.idInGame,
        zone: selectedCard.type === "spell" ? null : `bf${pendingSlotIndex! + 1}`,
        targets: selectedTargets.map(t => ({ targetId: t.target.idInGame }))
    });

    setSelectedCard(null);
    setSelectedTargets([]);
    setPotentialTargets([]);
    setPendingSlotIndex(null);
    setCurrentEffectIndex(0);
}

function handlePlayToSlot(slotIndex: number) {
    if (!selectedCard || !socketRef.current) return;
    if (selectedCard.runeCost > runes) {
      setRuneError("Not enough runes!");
      setTimeout(() => setRuneError(null), 1000);
      return;
    }

    if (playerSlots[slotIndex] || pendingSlots[slotIndex]) return;
    if (selectedCard.type === "spell") return;
    setPendingSlots(prev => {
        const next = [...prev]; // On copie l'état actuel

        // 1. On nettoie uniquement l'ancienne preview si elle existait
        if (pendingSlotIndex !== null) {
            next[pendingSlotIndex] = null;
        }

        // 2. On place la nouvelle carte à la nouvelle position
        next[slotIndex] = selectedCard;

        return next;
    });    // On pose TOUJOURS la carte en preview, qu'elle ait des effets ou non
    setPendingSlotIndex(slotIndex);


    setSelectedTargets([]);
    setPotentialTargets([]);

      // Si elle a besoin de cibles, on lance le ciblage
    const hasTargetedEffects = selectedCard.effects.some(e =>
        typeof e.target === "string" && ["opponent", "self", "all"].includes(e.target)
    );

    if (hasTargetedEffects) {
        getTargets();
    }
}

function getTargetCountForEffect(effect: any) {
  if (effect.effect === "swap") return 2;
  if (typeof effect.target !== "string") return 0;
  if (["self", "opponent", "all"].includes(effect.target)) return 1;
  return 0;
}

function getRequiredTargetCount(card: Card) {
  return Array.isArray(card.effects)
    ? card.effects.reduce((count: number, e: any) => count + getTargetCountForEffect(e), 0)
    : 0;
}

function getNextEffectIndex(card: Card, targets: Array<{ target: Card | Hero; effectIndex: number }>) {
  const effects = card.effects;
  let effectIndex = 0;
  while (effectIndex < effects.length) {
    const required = getTargetCountForEffect(effects[effectIndex]);
    const selectedCount = targets.filter(t => t.effectIndex === effectIndex).length;
    if (selectedCount < required) return effectIndex;
    effectIndex += 1;
  }

  return effects.length;
}

function handleEndTurn() {
    if (!socketRef.current) return;
    socketRef.current.emit('end_turn');
  }

function getTargets(effectIndex: number = 0, card: Card | null = selectedCard) {
    console.log("getTargets for card", { card });

    if (!card) return;
    const ef = card.effects;
    if (effectIndex >= ef.length) {
        setPotentialTargets([]);
        return;
    }
    const e = ef[effectIndex];

    if (typeof e.target === "string" && ["self_hero","opponent_hero","left_neighbor","right_neighbor",
         "all_allies","all_enemies","all_board","random_enemies","random_allies","random_all"].includes(e.target)) {
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

    if (e.targetType?.hero) {
        if (e.target === "opponent") pool.push(game.players[1 - myPlayerIndexRef.current!]);
        else if (e.target === "self") pool.push(game.players[myPlayerIndexRef.current!]);
        else if (e.target === "all") pool.push(...game.players);
    }

    if (!e.targetType?.creature) pool = pool.filter(c => !('type' in c) || c.type !== "creature");
    if (!e.targetType?.building) pool = pool.filter(c => !('type' in c) || c.type !== "building");

console.log("game:", game, "myPlayerIndex:", myPlayerIndexRef.current, "e.targetType:", e.targetType)
    setPotentialTargets(pool);
    setCurrentEffectIndex(effectIndex);
    console.log("Potential targets for effect", { effect: e, pool });
}

  function abortPlay() {
    // 1. On vide le slot en attente
    setPendingSlots(prev => {
        const next = [...prev];
        if (pendingSlotIndex !== null) {
            next[pendingSlotIndex] = null;
        }
        return next;
    });

    // 2. On reset tous les états de ciblage et de sélection
    setSelectedCard(null);
    setPendingSlotIndex(null);
    setSelectedTargets([]);
    setPotentialTargets([]);
}

function pushSelectedTarget(target: Card | Hero) {
    if (!selectedCard) return;

    const existingIndex = selectedTargets.findIndex((st) => st.target.idInGame === target.idInGame);

    if (existingIndex !== -1) {
        const nextTargets = [...selectedTargets];
        nextTargets.splice(existingIndex, 1);
        setSelectedTargets(nextTargets);

        const nextEffectIndex = getNextEffectIndex(selectedCard, nextTargets);
        getTargets(nextEffectIndex, selectedCard);
        return;
    }

    if (!potentialTargets.some(c => c.idInGame === target.idInGame)) return;

    const nextTargets = [...selectedTargets, { target, effectIndex: currentEffectIndex }];
    setSelectedTargets(nextTargets);

    const selectedForEffect = nextTargets.filter(st => st.effectIndex === currentEffectIndex).length;
    const requiredForEffect = getTargetCountForEffect(selectedCard.effects[currentEffectIndex]);

    const nextEffectIndex = selectedForEffect >= requiredForEffect
      ? getNextEffectIndex(selectedCard, nextTargets)
      : currentEffectIndex;

    getTargets(nextEffectIndex, selectedCard);
}

    return (
    <main className="overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center p-4 text-white/80">
      <Navbar />
      {!selectedHero ? (
        <HeroSelection onSelect={(id) => setSelectedHero(id)} />
      ) : (
        <>
          {isLoading ? (
            <div className="pt-20 text-center text-blue-200/70">Loading game...</div>
          ) : (
            <div className="hidden md:grid grid-cols-3 gap-4 pt-16 min-h-[calc(100vh-6rem)]">
              <div className="col-span-2 flex flex-col gap-4 min-h-0">
                <OpponentBoard
                cards={opponentSlots}
                onPlay={() => {}}
                potentialTargets={potentialTargets}
                selectedTargets={selectedTargets.map(st => st.target)}
                onClick={pushSelectedTarget} />
<PlayerBoard
    cards={displaySlots}
    onPlay={handlePlayToSlot}
    potentialTargets={potentialTargets}
    selectedTargets={selectedTargets.map(st => st.target)}
    onClick={pushSelectedTarget}
/>
<PlayerHand
    cards={playerHandCards}
    onClick={(card) => {
        if (!card) return;
        abortPlay();
        setSelectedCard(card);
        if (card.type === "spell") {
            getTargets(0, card);
        }
    }}
/>                </div>
              <div className="max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-4">
<GameStats
  turnNumber={turnNumber}
  me={meStats}
  opponent={opponentStats}
  onEndTurn={handleEndTurn}
  highlightOpponentHero={potentialTargets.some(t => t.kind === "hero" && t !== game?.players[myPlayerIndexRef.current!])}
  highlightPlayerHero={potentialTargets.some(t => t.kind === "hero" && t === game?.players[myPlayerIndexRef.current!])}
  isOpponentHeroSelected={selectedTargets.some(t => t.target.kind === "hero" && t.target.idInGame === game?.players[1 - myPlayerIndexRef.current!]?.idInGame)}
  isPlayerHeroSelected={selectedTargets.some(t => t.target.kind === "hero" && t.target.idInGame === game?.players[myPlayerIndexRef.current!]?.idInGame)}
  onHeroClick={(type: "self" | "opponent") => {
    console.log("onHeroClick", type, "highlightOpponentHero:", potentialTargets.some(t => t.kind === "hero"))
    const index = type === "opponent" ? 1 - myPlayerIndexRef.current! : myPlayerIndexRef.current!;
    const hero = game?.players[index];
    console.log("hero trouvé:", hero);
    if (hero) pushSelectedTarget(hero);
  }}
/>
<div className="flex flex-1 items-center justify-center gap-4 p-4">
  <LargeCardView
    card={selectedCard}
    onClick={getTargets}
    onConfirm={handleConfirmSpell}
    hasTargets={
        selectedCard
        ? (selectedCard.type === "spell"
            ? selectedTargets.length >= getRequiredTargetCount(selectedCard)
            : pendingSlotIndex !== null) // Toujours vrai si une créature est en preview
        : false
    }
/>
<ConfirmPlay onClick={handleConfirmSpell} disabled={!selectedCard} />
<></>
</div>
</div>
            </div>
          )}
        </>
      )}
      {runeError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 px-4 py-2 rounded border border-red-500 text-sm z-50">
          {runeError}
        </div>
      )}
    </main>
  );
}

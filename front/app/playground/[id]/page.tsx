"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import Navbar from '../../components/navigation/Navbar';
import HeroSelection from '../../components/playground/HeroSelection';
import OpponentBoard from '../../components/playground/OpponentBoard';
import PlayerBoard from '../../components/playground/PlayerBoard';
import PlayerHand from '../../components/playground/PlayerHand';
import GameStats from '../../components/playground/GameStats';
import type { Card } from 'otta-shared-types/card';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';
import LargeCardView from '@/app/components/playground/LargeCardView';

export default function PlaygroundPage() {
  const { id } = useParams();
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<Card | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<Card[]>([]);
  const [potentialTargets, setPotentialTargets] = useState<Card[]>([]);
  const [isHeroTarget, setIsHeroTarget] = useState<boolean>(false);
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
  const myPlayerIndexRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!selectedHero) return;

    const newSocket = io('http://localhost:3000');
    socketRef.current = newSocket;
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
        if (data.winner === -1) {
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

        // Envoi de la carte avec les cibles si elles existent, sinon null
        socketRef.current?.emit('play_card', {
            cardId: selectedCard.idInGame,
            zone: selectedCard.type === "spell" ? null : `bf${pendingSlotIndex! + 1}`,
            // Si aucune cible n'a été sélectionnée, on envoie null (c'est le choix du joueur)
            targetId: selectedTargets[0]?.idInGame ?? null,
            target2Id: selectedTargets[1]?.idInGame ?? null,
        });

          // Reset total
          setSelectedCard(null);
          setSelectedTargets([]);
          setPotentialTargets([]);
          setPendingSlotIndex(null);
      }

      function selectCardInHand(card: Card) {
    abortPlay(); // <--- Annule tout avant de sélectionner la nouvelle
    setSelectedCard(card);
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

function getRequiredTargetCount(card: Card) {

  // Si c'est un effet "all" ou "random", on n'attend aucune sélection utilisateur
  if (card.effects.some(e => typeof e.target === "string" && ["all_board", "all_allies", "all_enemies", "random"].includes(e.target))) {
    return 0;
  }
  
  // Si c'est "swap" ou tout effet nécessitant 2 cibles, tu retournes 2
  if (card.effects.some(e => e.effect === "swap")) {
    return 2;
  }

  // Sinon, si c'est "opponent" ou "self", on attend 1 cible
  if (card.effects.some(e => typeof e.target === "string" && ["opponent", "self", "all"].includes(e.target))) {
    return 1;
  }

  return 0;
}

function handleEndTurn() {
    if (!socketRef.current) return;
    socketRef.current.emit('end_turn');
  }

  function getTargets() {
    if (!selectedCard) return;
    const ef = Array.isArray(selectedCard.effects)
      ? selectedCard.effects
      : Array.isArray((selectedCard.effects as any)?.effects)
      ? (selectedCard.effects as any).effects
      : [];
    for (const e of ef) {
      if (["self_hero","opponent_hero","left_neighbor","right_neighbor","all_allies","random","all_board","all_enemies"].includes(e.target)) {
        continue;
      }
      if (e.target === "self" || e.target === "opponent" || e.target === "all") {
        switch (e.target) {
          case "self":
            setPotentialTargets(playerSlots.filter(c => c !== null) as Card[]);
            break;
          case "opponent":
            setPotentialTargets(opponentSlots.filter(c => c !== null) as Card[]);
            break;
          case "all":
            setPotentialTargets([...playerSlots, ...opponentSlots].filter(c => c !== null) as Card[]);
            break;
        }
        if (!(e.targetType?.creature)) setPotentialTargets(prev => prev.filter(c => c.type !== "creature"));
        if (!(e.targetType?.building)) setPotentialTargets(prev => prev.filter(c => c.type !== "building"));
        if (e.targetType?.hero) setIsHeroTarget(true);
      }
    }
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
// function pushSelectedTarget(card: Card) {
//       if (!selectedCard) return;
      
//       // On récupère le nombre requis via la fonction qu'on vient de créer
//       const required = getRequiredTargetCount(selectedCard);

//       // Si on a déjà assez de cibles, on ne fait rien
//       if (selectedTargets.length >= required) return;

//       // On ajoute la cible si elle est dans les choix valides (potentialTargets)
//       if (potentialTargets.some(c => c.idInGame === card.idInGame)) {
//         setSelectedTargets(prev => [...prev, card]);
//       }
//   }
function pushSelectedTarget(card: Card) {
    if (!selectedCard) return;

    // Si la carte est déjà sélectionnée, on la retire (Désélection)
    if (selectedTargets.some(t => t.idInGame === card.idInGame)) {
        setSelectedTargets(prev => prev.filter(t => t.idInGame !== card.idInGame));
        return;
    }

    const required = getRequiredTargetCount(selectedCard);
    
    // Si on a atteint le max, on ne fait rien
    if (selectedTargets.length >= required) return;

    // Ajout si c'est une cible valide
    if (potentialTargets.some(c => c.idInGame === card.idInGame)) {
        setSelectedTargets(prev => [...prev, card]);
    }
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
                selectedTargets={selectedTargets} 
                onClick={pushSelectedTarget} />
<PlayerBoard 
    cards={displaySlots} 
    onPlay={handlePlayToSlot} 
    potentialTargets={potentialTargets} 
    selectedTargets={selectedTargets} // <--- Ajoute ça
    onClick={pushSelectedTarget} 
/>
                <PlayerHand 
                    cards={playerHandCards} 
                    onClick={(card) => {
                        abortPlay(); // Nettoie le plateau (pendingSlot, etc.)
                        setSelectedCard(card);
                    }}
                />
                </div>
              <div className="max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-4">
                <GameStats
                  turnNumber={turnNumber}
                  me={meStats}
                  opponent={opponentStats}
                  onEndTurn={handleEndTurn}
                  highlightOpponentHero={isHeroTarget}
                />
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
/>              </div>
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
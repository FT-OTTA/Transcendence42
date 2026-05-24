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
  // console.log("Game ID from URL:", id);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [game, setGame] = useState<any>(null);

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<Card  | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<Card[]>([]); // Pour les sorts à plusieurs cibles
  const [potentialTargets, setPotentialTargets] = useState<Card[]>([]); // Cibles valides pour le sort sélectionné
  const [isHeroTarget, setIsHeroTarget] = useState<boolean>(false); // Si le sort peut cibler un héros
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local game state
  const [hand, setHand] = useState<(Card | null)[]>(Array(8).fill(null));
  const [playerSlots, setPlayerSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [opponentSlots, setOpponentSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [runes, setRunes] = useState(100);

  const [meStats, setMeStats] = useState<any>(null);
  const [opponentStats, setOpponentStats] = useState<any>(null);
  const [turnNumber, setTurnNumber] = useState(1);
  const [pendingSlots, setPendingSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const myPlayerIndexRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // 2. Initialisation du socket uniquement quand le héros est choisi
  useEffect(() => {
    console.log("Selected Hero:", selectedHero)
    if (!selectedHero) return;

    const newSocket = io('http://localhost:3000');
    socketRef.current = newSocket;
    setSocket(newSocket);

    console.log("Écouteur configuré sur socket:", newSocket.id); // Ajoute ça
    // On stocke l'index du joueur localement pour le réutiliser
    let myPlayerIndex: number | null = null;

    newSocket.on('connect', () => {
        console.log("Socket connecté, envoi de join_game");
        newSocket.emit('join_game', { heroId: selectedHero });
    });
    const battlefieldToSlots = (battlefield: any) => {
        const slots = Array(8).fill(null);
        for (let i = 1; i <= 8; i++) {
            slots[i - 1] = battlefield[`bf${i}`] ?? null;
        }
        return slots;
    };

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
        console.log("Game over:", data);
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
        console.log('REÇU GAME START:', data);
        myPlayerIndexRef.current = data.playerIndex; // On sauvegarde l'index

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
        if (myPlayerIndexRef.current === null) return; // Sécurité
        console.log('REÇU GAME UPDATE:', data);
        const me = data.game.players[myPlayerIndexRef.current];

        const opponent = data.game.players[1 - myPlayerIndexRef.current];
        setGame(data.game);
        setMeStats(me);
        setOpponentStats(opponent);
        setTurnNumber(data.game.turnNumber);
        setHand(me.hand);
        setRunes(me.curRunes);
        setPlayerSlots(battlefieldToSlots(me.battlefield));
        console.log("ME BF", me.battlefield);
        setOpponentSlots(battlefieldToSlots(opponent.battlefield));
    });

    return () => {
        newSocket.disconnect();
    };
  }, [selectedHero]);
  const playerHandCards = useMemo(() => hand, [hand]);


  function handlePlayToSlot(slotIndex: number) {
    console.log('handlePlayToSlot appelé', { selectedCard, socket: !!socketRef.current })
    console.log('slotIndex:', slotIndex)
    if (playerSlots[slotIndex] || pendingSlots[slotIndex]) return;
    if (!selectedCard || !socketRef.current) return;
    if (selectedCard.type === "spell") return; // Pour l'instant, on gère que les créatures/bâtiments

    setPendingSlots(prev => {
    const next = [...prev];
    next[slotIndex] = selectedCard;
    return next;
})
    console.log('Emitting play_card with:', {
        cardId: selectedCard.idInGame,
        zone: `bf${slotIndex + 1}`,
        targetId: selectedTargets[0]?.idInGame ?? null,
        target2Id: selectedTargets[1]?.idInGame ?? null,
    });
    socketRef.current.emit('play_card', {
        cardId: selectedCard.idInGame,
        zone: `bf${slotIndex + 1}`,  // format attendu par le backend
        targetId: selectedTargets[0]?.idInGame ?? null, // On prend la première cible sélectionnée pour l'instant
        target2Id: selectedTargets[1]?.idInGame ?? null, // Si un sort à 2 cibles
    })
    setSelectedCard(null)
}

function handleEndTurn() {
    console.log('handle endturn received socket id:', socketRef.current?.id)
    if (!socketRef.current) return;
    socketRef.current.emit('end_turn')
}

function getTargets() {
  if (!selectedCard) return;

  //if (!socketRef.current) {
  //  alert("No socket connection!");
  //  return;
  //}

    console.log("Selected card:", selectedCard);

  const ef = Array.isArray(selectedCard.effects)
    ? selectedCard.effects
    : Array.isArray((selectedCard.effects as any)?.effects)
    ? (selectedCard.effects as any).effects
    : [];
    for (const e of ef) {
    if (e.target === "self_hero" ||
      e.target === "opponent_hero" ||
      e.target === "left_neighbor" ||
      e.target === "right_neighbor" ||
      e.target === "all_allies" ||
      e.target === "random" ||
      e.target === "all_board" ||
      e.target === "all_enemies") {
        console.log("No target needed for effect:", e.effect);
        continue;
      }
      if (e.target === "self" || e.target === "opponent") {
        console.log("Target type:", e.targetType);
        switch (e.target) {
          case "self":
            setPotentialTargets(playerSlots.filter(c => c !== null) as Card[]);
            break;
          case "opponent":
            setPotentialTargets(opponentSlots.filter(c => c !== null) as Card[]);
            break;
      }
      if (!(e.targetType?.creature)) {
        setPotentialTargets(prev => prev.filter(c => c.type !== "creature"));
      }
      if (!(e.targetType?.building)) {
        setPotentialTargets(prev => prev.filter(c => c.type !== "building"));
      }
      if (e.targetType?.hero) {
        setIsHeroTarget(true);
      }
      console.log("Potential targets after filtering:", potentialTargets);
      if (potentialTargets.length === 0) {
        console.log("No valid targets for this card's effects. You can still play it, but it won't do anything.");
      }
      // Now highlight potential targets in UI
    }
  }
}

function pushSelectedTarget(card: Card) {
  if (!selectedCard) return;

  if (potentialTargets.some(c => c === card)) {
    setSelectedTargets(prev => [...prev, card]);
    console.log("Selected target:", card);
  }
}


const displaySlots = playerSlots.map((card, i) => card ?? pendingSlots[i]);

// 3. Structure de rendu conditionnelle
return (
    <main className="overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center p-4 text-white/80">
      <Navbar />

      {!selectedHero ? (
        // Affiche la sélection si aucun héros n'est choisi
        <HeroSelection onSelect={(id) => setSelectedHero(id)} />
      ) : (
        // Affiche le plateau de jeu
        <>
          {isLoading ? (
            <div className="pt-20 text-center text-blue-200/70">Loading game...</div>
          ) : (
            <div className="hidden md:grid grid-cols-3 gap-4 pt-16 min-h-[calc(100vh-6rem)]">
              <div className="col-span-2 flex flex-col gap-4 min-h-0">
                <OpponentBoard cards={opponentSlots} onPlay={() => {}} potentialTargets={potentialTargets} onClick={pushSelectedTarget} />
                <PlayerBoard cards={displaySlots} onPlay={handlePlayToSlot} potentialTargets={potentialTargets} onClick={pushSelectedTarget} />
                <PlayerHand cards={playerHandCards} onClick={setSelectedCard}/>
              </div>
              <div className="max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-4">
                <GameStats
                  turnNumber={turnNumber}
                  me={meStats}
                  opponent={opponentStats}
                  onEndTurn={handleEndTurn}
                  highlightOpponentHero={isHeroTarget}
                />
                <LargeCardView card={selectedCard} onClick={getTargets} />
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

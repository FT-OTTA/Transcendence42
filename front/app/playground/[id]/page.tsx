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

  function handlePlayToSlot(slotIndex: number) {
    if (!selectedCard || !socketRef.current) return;
    if (selectedCard.runeCost > runes) {
      setRuneError("Not enough runes to play this card!");
      setTimeout(() => setRuneError(null), 1000);
      return;
    }
    if (playerSlots[slotIndex] || pendingSlots[slotIndex]) return;
    if (selectedCard.type === "spell") return;

    setPendingSlots(prev => {
      const next = [...prev];
      next[slotIndex] = selectedCard;
      return next;
    });

    socketRef.current.emit('play_card', {
        cardId: selectedCard.idInGame,
        zone: `bf${slotIndex + 1}`,
        targetId: selectedTargets[0]?.idInGame ?? null,
        target2Id: selectedTargets[1]?.idInGame ?? null,
    });
    setSelectedCard(null);
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
      if (e.target === "self" || e.target === "opponent") {
        switch (e.target) {
          case "self":
            setPotentialTargets(playerSlots.filter(c => c !== null) as Card[]);
            break;
          case "opponent":
            setPotentialTargets(opponentSlots.filter(c => c !== null) as Card[]);
            break;
        }
        if (!(e.targetType?.creature)) setPotentialTargets(prev => prev.filter(c => c.type !== "creature"));
        if (!(e.targetType?.building)) setPotentialTargets(prev => prev.filter(c => c.type !== "building"));
        if (e.targetType?.hero) setIsHeroTarget(true);
      }
    }
  }

  function pushSelectedTarget(card: Card) {
    if (!selectedCard) return;
    if (potentialTargets.some(c => c === card)) {
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
      {runeError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 px-4 py-2 rounded border border-red-500 text-sm z-50">
          {runeError}
        </div>
      )}
    </main>
  );
}
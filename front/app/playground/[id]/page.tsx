"use client";



import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/navigation/Navbar';
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
      console.log("Game ID from URL:", id);
  const socket = io('http://localhost:3000');
  const [game, setGame] = useState<any>(null);

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local game state for frontend-only play
  const [hand, setHand] = useState<(Card | null)[]>(Array(8).fill(null));
  const [playerSlots, setPlayerSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [opponentSlots, setOpponentSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [runes, setRunes] = useState(100);

  useEffect(() => {
    socket.emit('join_game', {
      heroId: 'h001' // à remplacer par le vrai héros choisi
    })

    socket.on('game_start', (data) => {
        console.log('Game started:', data.game)
        setGame(data.game)
        const me = data.game.players[data.playerIndex]
        const opponent = data.game.players[1 - data.playerIndex]
        setHand(me.hand)
        setRunes(me.curRunes)
        setPlayerSlots(Object.values(me.battlefield))
        setOpponentSlots(Object.values(opponent.battlefield))
        setIsLoading(false)
        console.log('MA MAIN:', me.hand)
    })

    socket.on('game_update', (data) => {
        console.log('Game update:', data.game)
        setGame(data.game)
        const me = data.game.players[0]
        setHand(me.hand)
        setRunes(me.curRunes)
        setPlayerSlots(Object.values(me.battlefield))
        const opponent = data.game.players[1]
        setOpponentSlots(Object.values(opponent.battlefield))
    })

    socket.on('turn_start', (data) => {
        console.log('Turn start:', data.game)
        setGame(data.game)
        const me = data.game.players[0]
        setHand(me.hand)
        setRunes(me.curRunes)
        setPlayerSlots(Object.values(me.battlefield))
        const opponent = data.game.players[1]
        setOpponentSlots(Object.values(opponent.battlefield))
    })

    socket.on('game_over', (data) => {
      console.log('Game over:', data.game)
    })

    socket.on('timeout', () => {
      console.log('Timeout !')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const playerHandCards = useMemo(() => hand, [hand]);
  const playerBoardCards = useMemo(() => playerSlots, [playerSlots]);
  const opponentBoardCards = useMemo(() => opponentSlots, [opponentSlots]);

  function canPlayById(cardId: number, targetIndex: number, targetIsOpponent: boolean) {
    const handIndex = hand.findIndex((c) => c?.idInGame === cardId);
    if (handIndex === -1) return false;
    const card = hand[handIndex];
    if (!card) return false;
    if (card.runeCost > runes) return false;
    const isSpell = card.type === 'spell';
    if (isSpell) {
      if (!targetIsOpponent) return false;
      return Boolean(opponentSlots[targetIndex]);
    }
    // Can't place on opponent side or overwrite slot (?)
    if (targetIsOpponent) return false;
    return !Boolean(playerSlots[targetIndex]);
  }

  function playToSlot(cardId: number, targetIndex: number, targetIsOpponent: boolean) {
    const handIndex = hand.findIndex((c) => c?.idInGame === cardId);
    if (handIndex === -1) return;
    const card = hand[handIndex];
    if (!card) return;
    if (!canPlayById(cardId, targetIndex, targetIsOpponent)) return;

    const isSpell = card.type === 'spell';
    setHand((h) => {
      const nh = [...h];
      nh[handIndex] = null;
      return nh;
    });

    // deduct runes
    setRunes((r) => r - card.runeCost);

	// Card go poof
    if (isSpell) {
      return;
    }
	// Card go board
    setPlayerSlots((ps) => {
      const np = [...ps];
      np[targetIndex] = card;
      return np;
    });
  }

  return (
    <main className="overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center p-4 text-white/80">
      <Navbar />

      {isLoading ? (
        <div className="pt-20 text-center text-blue-200/70">Loading cards...</div>
      ) : null}

      {errorMessage ? (
        <div className="pt-4 text-center text-red-300">{errorMessage}</div>
      ) : null}

      <div className="hidden md:grid grid-cols-3 gap-4 pt-16 min-h-[calc(100vh-6rem)]">
        <div className="col-span-2 flex flex-col gap-4 min-h-0">
          <OpponentBoard cards={opponentBoardCards} />
          <PlayerBoard cards={playerBoardCards} />
          <PlayerHand cards={playerHandCards} onClick={setSelectedCard} />
        </div>
        <div className="max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-4">
          <GameStats handCount={hand.filter(Boolean).length} loadedCards={cards.length} runes={runes} />
          <LargeCardView card={selectedCard} />
        </div>
      </div>

	  {/* Mobile Layout, stats to bottom */}
	  {/*Maybe enforce landscape mode and make a cleaner layout */}
      <div className="md:hidden pt-16 flex flex-col gap-4 pb-4">
        <OpponentBoard cards={opponentBoardCards} onPlay={playToSlot} />
        <PlayerBoard cards={playerBoardCards} onPlay={playToSlot} />
        <PlayerHand cards={playerHandCards} onClick={setSelectedCard} />
        <GameStats handCount={hand.filter(Boolean).length} loadedCards={cards.length} runes={runes} />
      </div>
    </main>
  );
}

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
      console.log("Game ID from URL:", id);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [game, setGame] = useState<any>(null);

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local game state
  const [hand, setHand] = useState<(Card | null)[]>(Array(8).fill(null));
  const [playerSlots, setPlayerSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [opponentSlots, setOpponentSlots] = useState<(Card | null)[]>(Array(8).fill(null));
  const [runes, setRunes] = useState(100);

  const myPlayerIndexRef = useRef<number | null>(null);
  // 2. Initialisation du socket uniquement quand le héros est choisi
  useEffect(() => {
    console.log("Selected Hero:", selectedHero)
    if (!selectedHero) return;

    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    console.log("Écouteur configuré sur socket:", newSocket.id); // Ajoute ça
    // On stocke l'index du joueur localement pour le réutiliser
    let myPlayerIndex: number | null = null;

    newSocket.on('connect', () => {
        console.log("Socket connecté, envoi de join_game");
        newSocket.emit('join_game', { heroId: selectedHero });
    });

    newSocket.on('game_start', (data) => {
        console.log('REÇU GAME START:', data);
        myPlayerIndexRef.current = data.playerIndex; // On sauvegarde l'index

        const me = data.game.players[data.playerIndex];
        const opponent = data.game.players[1 - data.playerIndex];

        setGame(data.game);
        setHand(me.hand);
        setRunes(me.curRunes);
        setPlayerSlots(Object.values(me.battlefield));
        setOpponentSlots(Object.values(opponent.battlefield));
        setIsLoading(false);
    });

    newSocket.on('game_update', (data) => {
        if (myPlayerIndex === null) return; // Sécurité

        const me = data.game.players[myPlayerIndex];
        const opponent = data.game.players[1 - myPlayerIndex];

        setGame(data.game);
        setHand(me.hand);
        setRunes(me.curRunes);
        setPlayerSlots(Object.values(me.battlefield));
        setOpponentSlots(Object.values(opponent.battlefield));
    });

    return () => {
        newSocket.disconnect();
    };
  }, [selectedHero]);
  const playerHandCards = useMemo(() => hand, [hand]);

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
                <OpponentBoard cards={opponentSlots} onPlay={() => {}} />
                <PlayerBoard cards={playerSlots} onPlay={() => {}} />
                <PlayerHand cards={playerHandCards} onClick={setSelectedCard}/>
              </div>
              <div className="max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-4">
                <GameStats
                  handCount={hand.filter(Boolean).length}
                  loadedCards={0}
                  runes={runes}
                />
                <LargeCardView card={selectedCard} />
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

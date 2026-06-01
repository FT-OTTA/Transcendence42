"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import Navbar from '../../../components/navigation/Navbar';
import HeroSelection from '../../../components/playground/HeroSelection';
import OpponentBoard from '../../../components/playground/OpponentBoard';
import PlayerBoard from '../../../components/playground/PlayerBoard';
import SpectatorBoard from '@/app/components/playground/SpectatorBoard'
import PlayerHand from '../../../components/playground/PlayerHand';
import GameStats from '../../../components/playground/GameStats';
import ConfirmPlay from '../../../components/playground/ConfirmPlay';
import type { Card } from 'otta-shared-types/card';
import { io, Socket } from 'socket.io-client';
import { useParams, useSearchParams } from 'next/navigation';
import LargeCardView from '@/app/components/playground/LargeCardView';
import { Hero } from 'otta-shared-types/hero';
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl';
import HeroStrip from '@/app/components/playground/HeroStripProps';
import ChatPanel from '@/app/components/lobby/ChatPanel';
import CardDetails from '@/app/components/playground/CardDetails';

export default function PlaygroundPage() {
  const { id } = useParams();
  const pathname = usePathname()

  // permet de restaurer la sélection du héros si la page est rechargée accidentellement (F5, crash, etc.) pendant une partie
  const [selectedHero, setSelectedHero] = useState<string | null>(() => {
      if (typeof window === 'undefined') return null
      const saved = localStorage.getItem('currentGame')
      if (!saved) return null
      const { roomId: savedRoomId, heroId } = JSON.parse(saved)
      if (savedRoomId === Number(id) && heroId) return heroId
      return null
  })
  const [hydrated, setHydrated] = useState(false)

// useEffect de restauration qui se déclenche à l'arrivée sur la page, et à chaque changement de pathname (permet de réinitialiser la sélection du héros si on quitte la page et qu'on y revient, ou si on recharge la page)
  useEffect(() => {
      const saved = localStorage.getItem('currentGame')
      if (saved) {
          const { roomId: savedRoomId, heroId } = JSON.parse(saved)
          if (savedRoomId === Number(id) && heroId) {
              setSelectedHero(heroId)
          }
      }
      setHydrated(true)
  }, [pathname])

  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<any>(null);
  const [waitingEndTurn, setWaitingEndTurn] = useState(false);
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
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false);
  const myPlayerIndexRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

const highlightOpponentHero = potentialTargets.some(t => t.kind === "hero" && t !== game?.players[myPlayerIndexRef.current!]);
const highlightPlayerHero = potentialTargets.some(t => t.kind === "hero" && t === game?.players[myPlayerIndexRef.current!]);
const isOpponentHeroSelected = selectedTargets.some(t => t.target.kind === "hero" && t.target.idInGame === game?.players[1 - myPlayerIndexRef.current!]?.idInGame);
const isPlayerHeroSelected = selectedTargets.some(t => t.target.kind === "hero" && t.target.idInGame === game?.players[myPlayerIndexRef.current!]?.idInGame);

  const searchParams = useSearchParams()
  const isSpectator = searchParams.get('spectate') === 'true'
  const roomId = id
  const socketDep = isSpectator ? 'spectator' : selectedHero

  useEffect(() => {
    if (!isSpectator && !selectedHero) return;

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
      console.log('isSpectator:', isSpectator, 'selectedHero:', selectedHero)
      if (isSpectator) {
            // On prévient le serveur qu'on veut juste regarder
            newSocket.emit('spectate', Number(roomId));
        } else {
            // Comportement normal pour les joueurs
            localStorage.setItem('currentGame', JSON.stringify({ roomId: Number(id), heroId: selectedHero }))
            console.log('Emitting join_game with heroId:', selectedHero, 'roomId:', roomId, 'username:', localStorage.getItem('username'))
            newSocket.emit('join_game', {
              heroId: selectedHero,
              roomId: Number(roomId),
              username: localStorage.getItem('username'),
              token: localStorage.getItem('token')

          });
        }
    });

    newSocket.on('turn_start', (data) => {
        if (isSpectator) return;
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
        const msg = data.message ?? (
            data.winner === -1 ? "Match nul !" :
            data.winner === myPlayerIndexRef.current ? "Vous avez gagné !" : "Vous avez perdu !"
        )
        setGameOverMessage(msg)
        localStorage.removeItem('currentGame')
    });

    newSocket.on('game_start', (data) => {
        console.log('game_start reçu', data.playerIndex)
        if (isSpectator) return;
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
        if (isSpectator) {
            // vue spectateur — on prend les deux joueurs directement
            setGame(data.game)
            setMeStats(data.game.players[0])
            setOpponentStats(data.game.players[1])
            setTurnNumber(data.game.turnNumber)
            setPlayerSlots(battlefieldToSlots(data.game.players[0].battlefield))
            setOpponentSlots(battlefieldToSlots(data.game.players[1].battlefield))
            setIsLoading(false)
            return
        }

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
        setIsLoading(false)  
        setWaitingEndTurn(false);
    });

    return () => { newSocket.disconnect(); };
  }, [socketDep]);

  const playerHandCards = useMemo(() => hand, [hand]);
  const displaySlots = playerSlots.map((card, i) => card ?? pendingSlots[i]);


  function handleConcede(){
    if (!socketRef.current) return
    if (confirm('You want to give up your runic power to Odin ?')) {
        socketRef.current.emit('concede')
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
    setWaitingEndTurn(true);
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

const onHeroClick = (type: "self" | "opponent") => {
    const index = type === "opponent" ? 1 - myPlayerIndexRef.current! : myPlayerIndexRef.current!;
    const hero = game?.players[index];
    if (hero)
        pushSelectedTarget(hero);
};

const locale = useLocale();
    if (!hydrated) return (
        <div className="pt-20 text-center text-blue-200/70">Loading game...</div>
    )
    return (
    <main className="overflow-x-hidden h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center p-4 text-white/80 overflow-y-hidden">
        <Navbar />

        {!isSpectator && !selectedHero ? (
            <HeroSelection onSelect={(id) => setSelectedHero(id)} />
        ) : (
            <>
                {isLoading ? (
                    <div className="pt-20 text-center text-blue-200/70">
                        Loading game...
                    </div>

                    ) : isSpectator ? (
                        <SpectatorBoard players={game?.players ?? []} turnNumber={game?.turnNumber ?? 0} />
                    ) : (
                    <>

                        {/* ── DESKTOP ── */}
                        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-3 gap-4 pt-16 h-[calc(100vh-6rem)]">

                            {/* Colonne principale — 3/4 */}
                            <div className="col-span-3 lg:col-span-2 flex flex-col gap-2 min-h-0">

                                <HeroStrip
                                    label="Opponent"
                                    playerClass={opponentStats?.class}
                                    armor={opponentStats?.armor ?? 0}
                                    dmgDealt={opponentStats?.dmgDealt ?? 0}
                                    deckCount={opponentStats?.library.length ?? 0}
                                    isHighlighted={highlightOpponentHero}
                                    isSelected={isOpponentHeroSelected}
                                    onClick={() => onHeroClick?.("opponent")}
                                    isOpponent
                                />
                                
                                <OpponentBoard
                                    cards={opponentSlots}
                                    onPlay={() => {}}
                                    potentialTargets={potentialTargets}
                                    selectedTargets={selectedTargets.map(st => st.target)}
                                    onClick={pushSelectedTarget}
                                />

                                <PlayerBoard
                                    cards={displaySlots}
                                    onPlay={handlePlayToSlot}
                                    potentialTargets={potentialTargets}
                                    selectedTargets={selectedTargets.map(st => st.target)}
                                    onClick={pushSelectedTarget}
                                />

                                <HeroStrip
                                    label="You"
                                    playerClass={meStats?.class}
                                    armor={meStats?.armor ?? 0}
                                    dmgDealt={meStats?.dmgDealt ?? 0}
                                    curRunes={meStats?.curRunes}
                                    handCount={meStats?.hand.length}
                                    deckCount={meStats?.library.length ?? 0}
                                    isHighlighted={highlightPlayerHero}
                                    isSelected={isPlayerHeroSelected}
                                    onClick={() => onHeroClick?.("self")}
                                />

                                <div>
                                    <ConfirmPlay onClick={handleConfirmSpell} disabled={!selectedCard} />
                                </div>

                                <PlayerHand
                                    cards={playerHandCards}
                                    onClick={(card) => {
                                        if (!card) return;
                                        abortPlay();
                                        setSelectedCard(card);
                                        if (card.type === "spell") getTargets(0, card);
                                    }}
                                    onConfirm={handleConfirmSpell}
                                />

                            </div>

                            {/* Colonne droite — 1/4 */}
                            <div className="flex flex-col gap-4 max-h-[calc(100vh-6rem)] overflow-y-auto">

                                <div className="flex items-center justify-center gap-5">
                                    
                                    {/* End Turn centré */}
                                    <div>
                                        <button
                                            disabled={waitingEndTurn}
                                            onClick={handleEndTurn}
                                            className="border rounded-xl border-blue-300 py-1.5 px-2 text-sm hover:bg-blue-300 hover:text-black transition"
                                            >
                                                {waitingEndTurn ? "..." : "End Turn"}
                                        </button>
                                    </div>
                                    
                                    {/* Tour */}
                                    <div className="text-center text-sm text-blue-300/60 py-1">
                                        Turn {turnNumber}/8
                                    </div>

                                    <button
                                            onClick={handleConcede}
                                            className="border border-red-400/40 py-2 px-2 text-xs text-red-400 hover:bg-red-400/20 transition rounded-sm"
                                            >
                                                Concede
                                    </button>
                                </div>

                                {/* Chat */}
                                <div className="flex-1 min-h-0">
                                    <ChatPanel />
                                </div>

                                {/* LargeCard + Confirm */}
                                <div className="flex flex-col gap-2">
                                    <CardDetails
                                        card={selectedCard}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── MOBILE ── */}
                        <div className="flex flex-col md:hidden pt-14 h-[calc(100vh-3.5rem)] overflow-hidden">
                            <OpponentBoard
                                cards={opponentSlots}
                                onPlay={() => {}}
                                potentialTargets={potentialTargets}
                                selectedTargets={selectedTargets.map(st => st.target)}
                                onClick={pushSelectedTarget}
                            />
                            <PlayerBoard
                                cards={displaySlots}
                                onPlay={handlePlayToSlot}
                                potentialTargets={potentialTargets}
                                selectedTargets={selectedTargets.map(st => st.target)}
                                onClick={pushSelectedTarget}
                            />
                            <PlayerHand
                                cards={playerHandCards}
                                onConfirm={handleConfirmSpell}
                                onClick={(card) => {
                                if (!card) return;
                                abortPlay();
                                setSelectedCard(card);
                                if (card.type === "spell") getTargets(0, card);
                                }}
                            />

                            {/* Bandeau bas mobile — pas de carte sélectionnée */}
                                {
                                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-blue-400/40 px-4 py-2 flex items-center justify-between">
                                    <span className="text-yellow-400 font-semibold text-sm">⬡ {runes} runes</span>
                                    
                                    <button
                                        disabled={waitingEndTurn}
                                        onClick={handleEndTurn}
                                        className="border border-blue-300 px-4 py-1 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition"
                                        >
                                        {waitingEndTurn ? "..." : "End Turn"}
                                    </button>

                                    <button
                                        onClick={() => setShowStats(true)}
                                        className="border border-blue-400/40 px-3 py-1 text-sm text-blue-300"
                                        >
                                        ⚔️
                                    </button>
                                </div>
                            }

                            {/* LargeCardView en overlay si une carte est sélectionnée */}
                            {selectedCard && (
                                <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
                                    <LargeCardView
                                        card={selectedCard}
                                        onClick={getTargets}
                                        onConfirm={handleConfirmSpell}
                                        hasTargets={
                                        selectedCard.type === "spell"
                                            ? selectedTargets.length >= getRequiredTargetCount(selectedCard)
                                            : pendingSlotIndex !== null
                                        }
                                    />
                                    {/* <ConfirmPlay onClick={handleConfirmSpell} disabled={!selectedCard} /> */}
                                </div>
                            )}

                            {/* Stats drawer */}
                            {showStats && (
                                <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
                                    <div className="w-full bg-slate-900 border-t border-blue-400 p-4 rounded-t-xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                                        <button
                                            onClick={() => setShowStats(false)}
                                            className="self-end text-blue-300 text-lg"
                                            >
                                            ✕
                                        </button>

                                        <GameStats
                                            turnNumber={turnNumber}
                                            me={meStats}
                                            opponent={opponentStats}
                                            highlightOpponentHero={potentialTargets.some(t => t.kind === "hero" && t !== game?.players[myPlayerIndexRef.current!])}
                                            highlightPlayerHero={potentialTargets.some(t => t.kind === "hero" && t === game?.players[myPlayerIndexRef.current!])}
                                            isOpponentHeroSelected={selectedTargets.some(t => t.target.kind === "hero" && t.target.idInGame === game?.players[1 - myPlayerIndexRef.current!]?.idInGame)}
                                            isPlayerHeroSelected={selectedTargets.some(t => t.target.kind === "hero" && t.target.idInGame === game?.players[myPlayerIndexRef.current!]?.idInGame)}
                                            onHeroClick={(type: "self" | "opponent") => {
                                                const index = type === "opponent" ? 1 - myPlayerIndexRef.current! : myPlayerIndexRef.current!;
                                                const hero = game?.players[index];
                                                if (hero)
                                                    pushSelectedTarget(hero);
                                                setShowStats(false);
                                            }}
                                            onConcede={handleConcede}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </>
        )}

        {gameOverMessage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="border border-blue-300 bg-black/90 p-8 flex flex-col items-center gap-6 rounded-sm">
            <p className="text-2xl text-blue-200">{gameOverMessage}</p>
            <button
                onClick={() => window.location.href = `/${locale}/lobby`}
                className="border border-blue-300 px-6 py-2 hover:bg-blue-300 hover:text-black transition"
            >
                Retour au lobby
            </button>
            </div>
        </div>
        )}

        {runeError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 px-4 py-2 rounded border border-red-500 text-sm z-50">
            {runeError}
        </div>
        )}
    </main>
    );
}
"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

import Navbar from '../../../components/navigation/Navbar';
import HeroSelection from '../../../components/playground/HeroSelection';
import OpponentBoard from '../../../components/playground/OpponentBoard';
import PlayerBoard from '../../../components/playground/PlayerBoard';
import PlayerHand from '../../../components/playground/PlayerHand';
import GameStats from '../../../components/playground/GameStats';
import ConfirmPlay from '../../../components/playground/ConfirmPlay';
import LargeCardView from '../../../components/playground/LargeCardView';
import SpectatorBoard from '../../../components/playground/SpectatorBoard';

import { useGame } from './useGame';
import { useTargeting, getRequiredTargetCount } from './useTargeting';

export default function PlaygroundPage() {
    const { id } = useParams() as { id: string };
    const pathname = usePathname();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const isSpectator = searchParams.get('spectate') === 'true';

    // ── Hero selection + hydration ──
    const [selectedHero, setSelectedHero] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('currentGame');
        if (!saved) return null;
        const { roomId: savedRoomId, heroId } = JSON.parse(saved);
        return savedRoomId === Number(id) && heroId ? heroId : null;
    });
    const [hydrated, setHydrated] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [runeError, setRuneError] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('currentGame');
        if (saved) {
            const { roomId: savedRoomId, heroId } = JSON.parse(saved);
            if (savedRoomId === Number(id) && heroId) setSelectedHero(heroId);
        }
        setHydrated(true);
    }, [pathname]);

    // ── Game socket hook ──
    const {
        game, isLoading, hand, playerSlots, opponentSlots,
        runes, meStats, opponentStats, turnNumber,
        gameOverMessage, waitingEndTurn, myPlayerIndexRef,
        handleEndTurn, handleConcede, emitPlayCard,
    } = useGame(id, isSpectator, hydrated ? selectedHero : null);
    // ── Targeting hook ──
    const {
        selectedCard, setSelectedCard,
        selectedTargets, potentialTargets,
        pendingSlots, setPendingSlots,
        pendingSlotIndex, setPendingSlotIndex,
        getTargets, pushSelectedTarget, abortPlay, resetAfterPlay,
    } = useTargeting(playerSlots, opponentSlots, game, myPlayerIndexRef);

    const playerHandCards = useMemo(() => hand, [hand]);
    const displaySlots = playerSlots.map((card, i) => card ?? pendingSlots[i]);

    // ── Actions ──
    function handleConfirmSpell() {
        if (!selectedCard) return;
        emitPlayCard({
            cardId: selectedCard.idInGame,
            zone: selectedCard.type === "spell" ? null : `bf${pendingSlotIndex! + 1}`,
            targets: selectedTargets.map(t => ({ targetId: t.target.idInGame })),
        });
        resetAfterPlay();
    }

    function handlePlayToSlot(slotIndex: number) {
        if (!selectedCard) return;
        if (selectedCard.runeCost > runes) {
            setRuneError("Not enough runes!");
            setTimeout(() => setRuneError(null), 1000);
            return;
        }
        if (playerSlots[slotIndex] || pendingSlots[slotIndex]) return;
        if (selectedCard.type === "spell") return;

        setPendingSlots(prev => {
            const next = [...prev];
            if (pendingSlotIndex !== null) next[pendingSlotIndex] = null;
            next[slotIndex] = selectedCard;
            return next;
        });
        setPendingSlotIndex(slotIndex);

        const hasTargetedEffects = selectedCard.effects.some((e: any) =>
            typeof e.target === "string" && ["opponent", "self", "all"].includes(e.target)
        );
        if (hasTargetedEffects) getTargets();
    }

    const hasTargets = selectedCard
        ? (selectedCard.type === "spell"
            ? selectedTargets.length >= getRequiredTargetCount(selectedCard)
            : pendingSlotIndex !== null)
        : false;

    const gameStatsProps = {
        turnNumber,
        me: meStats,
        opponent: opponentStats,
        highlightOpponentHero: potentialTargets.some(t => t.kind === "hero" && t !== game?.players[myPlayerIndexRef.current!]),
        highlightPlayerHero: potentialTargets.some(t => t.kind === "hero" && t === game?.players[myPlayerIndexRef.current!]),
        isOpponentHeroSelected: selectedTargets.some(t => t.target.kind === "hero" && t.target.idInGame === game?.players[1 - myPlayerIndexRef.current!]?.idInGame),
        isPlayerHeroSelected: selectedTargets.some(t => t.target.kind === "hero" && t.target.idInGame === game?.players[myPlayerIndexRef.current!]?.idInGame),
        onHeroClick: (type: "self" | "opponent") => {
            const index = type === "opponent" ? 1 - myPlayerIndexRef.current! : myPlayerIndexRef.current!;
            const hero = game?.players[index];
            if (hero) pushSelectedTarget(hero);
        },
        onConcede: handleConcede,
    };

    const boardProps = {
        potentialTargets,
        selectedTargets: selectedTargets.map(st => st.target),
        onClick: pushSelectedTarget,
    };

    if (!hydrated) return <div className="pt-20 text-center text-blue-200/70">Loading game...</div>;

    return (
        <main className="overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center p-4 text-white/80">
            <Navbar />

            {!isSpectator && !selectedHero ? (
                <HeroSelection onSelect={setSelectedHero} />
            ) : isLoading ? (
                <div className="pt-20 text-center text-blue-200/70">Loading game...</div>
            ) : isSpectator ? (
                <SpectatorBoard players={game?.players ?? []} turnNumber={game?.turnNumber ?? 0} />
            ) : (
                <>
                    {/* ── DESKTOP ── */}
                    <div className="hidden md:grid grid-cols-3 gap-4 pt-16 min-h-[calc(100vh-6rem)]">
                        <div className="col-span-2 flex flex-col gap-4 min-h-0">
                            <OpponentBoard cards={opponentSlots} onPlay={() => {}} {...boardProps} />
                            <PlayerBoard cards={displaySlots} onPlay={handlePlayToSlot} {...boardProps} />
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
                        </div>
                        <div className="max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-4">
                            <GameStats {...gameStatsProps} />
                            <button
                                onClick={handleEndTurn}
                                disabled={waitingEndTurn}
                                className="border border-blue-300 py-2 px-3 text-sm hover:bg-blue-300 hover:text-black transition disabled:opacity-50"
                            >
                                {waitingEndTurn ? "Waiting for opponent..." : "End Turn"}
                            </button>
                            <div className="flex flex-col items-center gap-3 p-4">
                                <LargeCardView card={selectedCard} onClick={getTargets} onConfirm={handleConfirmSpell} hasTargets={hasTargets} />
                            </div>
                        </div>
                    </div>

                    {/* ── MOBILE ── */}
                    <div className="flex flex-col md:hidden pt-14 h-[calc(100vh-3.5rem)] overflow-hidden">
                        <OpponentBoard cards={opponentSlots} onPlay={() => {}} {...boardProps} />
                        <PlayerBoard cards={displaySlots} onPlay={handlePlayToSlot} {...boardProps} />
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

                        {/* Bandeau bas */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-blue-400/40 px-4 py-2 flex items-center justify-between">
                            <span className="text-yellow-400 font-semibold text-sm">⬡ {runes} runes</span>
                            <button
                                onClick={handleEndTurn}
                                disabled={waitingEndTurn}
                                className="border border-blue-300 px-4 py-1 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition disabled:opacity-50"
                            >
                                {waitingEndTurn ? "Waiting..." : "End Turn"}
                            </button>
                            <button onClick={() => setShowStats(true)} className="border border-blue-400/40 px-3 py-1 text-sm text-blue-300">
                                ⚔️
                            </button>
                        </div>

                        {/* Stats drawer */}
                        {showStats && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
                                <div className="w-full bg-slate-900 border-t border-blue-400 p-4 rounded-t-xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                                    <button onClick={() => setShowStats(false)} className="self-end text-blue-300 text-lg">✕</button>
                                    <GameStats
                                        {...gameStatsProps}
                                        onHeroClick={(type) => {
                                            gameStatsProps.onHeroClick(type);
                                            setShowStats(false);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Game over */}
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

            {/* Rune error */}
            {runeError && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 px-4 py-2 rounded border border-red-500 text-sm z-50">
                    {runeError}
                </div>
            )}
        </main>
    );
}

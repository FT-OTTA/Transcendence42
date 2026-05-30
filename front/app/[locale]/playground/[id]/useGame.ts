import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Card } from 'otta-shared-types/card';
import type { Hero } from 'otta-shared-types/hero';

function battlefieldToSlots(battlefield: any): (Card | null)[] {
    const slots = Array(8).fill(null);
    for (let i = 1; i <= 8; i++) slots[i - 1] = battlefield[`bf${i}`] ?? null;
    return slots;
}

export function useGame(roomId: string | string[], isSpectator: boolean, selectedHero: string | null) {
    const [game, setGame] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hand, setHand] = useState<(Card | null)[]>(Array(8).fill(null));
    const [playerSlots, setPlayerSlots] = useState<(Card | null)[]>(Array(8).fill(null));
    const [opponentSlots, setOpponentSlots] = useState<(Card | null)[]>(Array(8).fill(null));
    const [runes, setRunes] = useState(100);
    const [meStats, setMeStats] = useState<any>(null);
    const [opponentStats, setOpponentStats] = useState<any>(null);
    const [turnNumber, setTurnNumber] = useState(1);
    const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
    const [waitingEndTurn, setWaitingEndTurn] = useState(false);

    const myPlayerIndexRef = useRef<number | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const socketDep = isSpectator ? 'spectator' : selectedHero;

    useEffect(() => {
        if (!isSpectator && !selectedHero) return;

        const socket = io();
        socketRef.current = socket;

        socket.on('connect', () => {
            if (isSpectator) {
                socket.emit('spectate', Number(roomId));
            } else {
                localStorage.setItem('currentGame', JSON.stringify({ roomId: Number(roomId), heroId: selectedHero }));
                socket.emit('join_game', {
                    heroId: selectedHero,
                    roomId: Number(roomId),
                    username: localStorage.getItem('username'),
                    token: localStorage.getItem('token'),
                });
            }
        });

        socket.on('turn_start', (data) => {
            if (isSpectator || myPlayerIndexRef.current === null) return;
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

        socket.on('game_start', (data) => {
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

        socket.on('game_update', (data) => {
            if (isSpectator) {
                setGame(data.game);
                setMeStats(data.game.players[0]);
                setOpponentStats(data.game.players[1]);
                setTurnNumber(data.game.turnNumber);
                setPlayerSlots(battlefieldToSlots(data.game.players[0].battlefield));
                setOpponentSlots(battlefieldToSlots(data.game.players[1].battlefield));
                setIsLoading(false);
                return;
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
            setIsLoading(false);
            setWaitingEndTurn(false);
        });

        socket.on('game_over', (data) => {
            const msg = data.message ?? (
                data.winner === -1 ? "Match nul !" :
                data.winner === myPlayerIndexRef.current ? "Vous avez gagné !" : "Vous avez perdu !"
            );
            setGameOverMessage(msg);
            localStorage.removeItem('currentGame');
        });

        return () => { socket.disconnect(); };
    }, [socketDep]);

    function handleEndTurn() {
        if (!socketRef.current) return;
        setWaitingEndTurn(true);
        socketRef.current.emit('end_turn');
    }

    function handleConcede() {
        if (!socketRef.current) return;
        if (confirm('You want to give up your runic power to Odin ?')) {
            socketRef.current.emit('concede');
        }
    }

    function emitPlayCard(payload: any) {
        socketRef.current?.emit('play_card', payload);
    }

    return {
        game, isLoading, hand, playerSlots, opponentSlots,
        runes, meStats, opponentStats, turnNumber,
        gameOverMessage, waitingEndTurn, myPlayerIndexRef,
        handleEndTurn, handleConcede, emitPlayCard,
    };
}

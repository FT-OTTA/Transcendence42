import { Server, Socket } from 'socket.io'
import type { Hero } from '../types/hero.ts'
import type { Card, CardClass } from '../types/card.ts'
import type { Game } from '../types/gamesession.ts'
import type { Effect, EffectType, EffectTarget } from '../types/effects.ts'
import type { BfZone } from '../types/zones.ts'
import type { GameSession, WaitingPlayer } from '../types/gamesession.ts'
import { startTurn, checkVictory, resolveCombat, resolveBuildings, checkBoardState, playCard, resolveEffect } from '../engine/engine.ts'
import { prisma } from '../../prisma/prisma.ts'
import fs from 'fs'
import path from 'path'

let waitingPlayers: WaitingPlayer[] = [];
let sessions: GameSession[] = []

function findById(game: Game, id: number): Hero | Card | undefined {
    for (const player of game.players) {
        if (player.idInGame === id) return player
        const card = [
            ...player.hand,
            ...player.library,
            ...Object.values(player.battlefield)
        ].find(c => c?.idInGame === id)
        if (card) return card
    }
    return undefined
}

function resolveRound(session: GameSession): void {
    if (session.timer !== null)
        session.sockets.forEach(s => s.emit('timeout', {}))

    clearTimeout(session.timer!)
    session.timer = null

    for (const [socketId, cards] of session.submittedCards) {
        const playerIndex = session.sockets.findIndex(s => s.id === socketId)
        const player = session.game.players[playerIndex]

        for (const action of cards) {
            const card = player.hand.find(c => c.idInGame === action.cardId)
            if (!card) continue

            const zone = action.zone as BfZone | undefined
            const target = action.targetId
                ? findById(session.game, action.targetId)
                : undefined
            const target2 = action.target2Id
                ? findById(session.game, action.target2Id) as Card
                : undefined

            const enrichedPayload = {
                ...action,
                target: target,
                target2: target2
            }
            playCard(card, enrichedPayload);
        }
    }

    checkBoardState(session.game)
    resolveCombat(session.game)
    checkBoardState(session.game)

    session.submittedCards.clear()
    session.readyPlayers.clear()
    session.game.turnNumber += 1

    if (session.game.turnNumber > 8) {
        checkVictory(session.game)
        session.sockets.forEach(s => s.emit('game_over', { game: session.game }))
        // LOAD LA GAME DANS LA DB OKLM
    } else {
        startTurn(session.game)
        session.timer = setTimeout(() => resolveRound(session), session.game.clock_per_turn * 1000)
        session.sockets.forEach(s => s.emit('turn_start', { game: session.game }))
    }
}

function launchGame(session: GameSession): void {
    startTurn(session.game)
    session.timer = setTimeout(() => resolveRound(session), session.game.clock_per_turn * 1000)
    session.sockets.forEach(s => s.emit('game_start', { game: session.game }))
}

async function buildHero(heroId: string): Promise<Hero> {

    const hero = await prisma.hero.findUnique({
        where: {id: heroId}
    })

    if (!hero)
        throw new Error("Heros introuvable");

    // 2. Parsing du JSON de passif
    let passiveEffect: Effect = { 
            effect: "armor",      // Doit être dans EffectType
            value: 0, 
            target: "self_hero"   // Doit être dans EffectTarget
        };
    
    if (hero.passive_json_path) {
        try {
            const fullPath = path.join(process.cwd(), 'databases', 'heroes', 'passives', hero.passive_json_path);
            
            if (fs.existsSync(fullPath)) {
                const rawData = fs.readFileSync(fullPath, 'utf-8');
                const json = JSON.parse(rawData);
                
                // 2. Le Mapping sécurisé
                // On cast "as EffectType" et "as EffectTarget" pour valider le JSON
                passiveEffect = {
                    effect: (json.effect as EffectType) || "armor",
                    value: json.value ?? 0,
                    target: (json.target as EffectTarget) || "self_hero",
                    ...(json.targetType && { targetType: json.targetType as any })
                };
            }
        } catch (err) {
            console.error(`Erreur passif ${heroId}:`, err);
        }
    }

    return {
        kind: "hero",
        idInGame: Math.floor(Math.random() * 100000),
        class: hero.name as CardClass,
        passive: passiveEffect, // Là c'est carré, TS est content ✅
        armor: hero.base_armor,
        dmgDealt: 0,
        curRunes: 0,
        battlefield: {},
        library: [],
        graveyard: [],
        hand: [],
        heroPicPath: hero.illustration
    };
}
// 1. Ajoute 'async' ici
export async function instantiateGame(players: WaitingPlayer[]): Promise<Game> {
    
    // 2. On lance tous les buildHero en même temps et on attend qu'ils finissent
    const heroes = await Promise.all(
        players.map(p => buildHero(p.playerData.heroId))
    );

    return {
        kind: "game",
        phase: "beginning",
        turnNumber: 1,
        clock_per_turn: 60,
        players: heroes, // Là, 'heroes' est bien de type Hero[]
        backgroundPath: "default.png"
    };
}

export function initSocket(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log('Joueur connecté :', socket.id)

        // Il manque un token de room ou quoi
        socket.on('join_game', async (data) => {
            waitingPlayers.push({
                socket: socket,
                playerData: data
            })
            if (waitingPlayers.length === 2) {
                const players = [...waitingPlayers] // Copie pour éviter les effets de bord
                waitingPlayers = [] // On vide tout de suite pour les suivants

        // 2. On attend la création de la game (DB + Passifs)
                try {
                    const gameInstance = await instantiateGame(players)

                    const newSession: GameSession = {
                        game: gameInstance, // Maintenant c'est un vrai objet Game ✅
                        sockets: players.map(p => p.socket),
                        submittedCards: new Map<string, any[]>(),
                        readyPlayers: new Set<string>(),
                        timer: null
                    }

                    sessions.push(newSession)
                    launchGame(newSession)
                } catch (error) {
                    console.error("Erreur lancement game:", error)
                    socket.emit('error', { message: "Impossible de charger les données du héros" })
                }
            }
        })

        socket.on('play_card', (data) => {
            const session = sessions.find(s =>
                s.sockets.some(sock => sock.id === socket.id)
            )
            if (!session) return
            
            const playerIndex = session.sockets.findIndex(s => s.id === socket.id);
            const player = session.game.players[playerIndex];
            const card = player.hand.find(c => c.idInGame === data.cardId);

            if (!card) return;

            if (card.timing === "immediate")
            {
                // 1. On cherche la cible réelle dans la game
                const target = findById(session.game, data.targetId);
                const target2 = findById(session.game, data.target2Id);

                // 2. On crée un payload "enrichi" qui contient les vrais objets
                const fullPayload = {
                    ...data,
                    target: target,   // C'est maintenant un objet Hero ou Card
                    target2: target2
                };
                playCard(card, fullPayload);
                session.sockets.forEach((s, id) => {
                    const perspective = getPlayerPerspective(session.game, id);
                    s.emit('game_update', { game: perspective });
                });
            }
            else {
                const existing = session.submittedCards.get(socket.id) ?? [];
                existing.push(data);
                session.submittedCards.set(socket.id, existing);
            }
        })

        socket.on('end_turn', () => {
            const session = sessions.find(s =>
                s.sockets.some(sock => sock.id === socket.id)
            )
            if (!session) return

            session.readyPlayers.add(socket.id)

            if (session.readyPlayers.size === session.sockets.length)
                resolveRound(session)
        })

        socket.on('disconnect', () => {
            console.log('Joueur déconnecté :', socket.id)
        })
    })
}

function getPlayerPerspective(game: Game, playerIndex: number) {
    const copy = JSON.parse(JSON.stringify(game));
    copy.players.forEach((hero: any, index: number) => {
        if (index !== playerIndex) {
            hero.hand = hero.hand.map(() => ({ idInGame: -1, hidden: true }))
            hero.library = [];
        }
    });
    return copy;
}
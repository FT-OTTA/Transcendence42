import { Server, Socket } from 'socket.io'
import type { Hero } from '../types/hero.ts'
import type { Card, CardClass, CardType, CreatureState } from '../types/card.ts'
import type { Game } from '../types/gamesession.ts'
import type { Effect, EffectType, EffectTarget, EffectTime } from '../types/effects.ts'
import type { BfZone } from '../types/zones.ts'
import type { GameSession, WaitingPlayer } from '../types/gamesession.ts'
import { startTurn, checkVictory, resolveCombat, resolveBuildings, checkBoardState, playCard, resolveEffect, GameOver} from '../engine/engine.ts'
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
    console.log("Résolution du tour", session.game.turnNumber);
    if (session.timer === null)
        session.sockets.forEach(s => s.emit('timeout', {}))

    clearTimeout(session.timer!)
    session.timer = null

    for (const [socketId, cards] of session.submittedCards) {
        const playerIndex = session.sockets.findIndex(s => s.id === socketId)
        const player = session.game.players[playerIndex]

        for (const { card, payload } of cards)
        {
            console.log('payload:', payload, 'card found:', !!card)
            console.log('calling playCard with zone:', payload.zone)


            if (!card) continue

            const zone = payload.zone as BfZone | undefined
            const target = payload.targetId
                ? findById(session.game, payload.targetId)
                : undefined
            const target2 = payload.target2Id
                ? findById(session.game, payload.target2Id) as Card
                : undefined

            const enrichedPayload = {
                ...payload,
                target: target,
                target2: target2
            }
            playCard(card, enrichedPayload);
        }
    }

    try {
        checkBoardState(session.game)
        resolveCombat(session.game)
        console.log("Après combat :")
        checkBoardState(session.game)
        console.log("Après vérification board :")

    } catch (e) {
        if (e instanceof GameOver) {
            console.log(`Game over détecté : ${e.message}`)
            session.sockets.forEach((s, id) => {
                s.emit('game_over', { game: getPlayerPerspective(session.game, id), message: e.message })
            })
            return
        }
    }

    session.submittedCards.clear()
    session.readyPlayers.clear()
    session.game.turnNumber += 1
    console.log("Tour actuel avant check :", session.game.turnNumber);
    if (session.game.turnNumber > 8) {
        checkVictory(session.game)
        session.sockets.forEach((s, id) => {
            s.emit('game_over', { game: getPlayerPerspective(session.game, id) })
        })
    } else {
        startTurn(session.game)
        session.timer = setTimeout(() => resolveRound(session), session.game.clock_per_turn * 1000)
        session.sockets.forEach((s, id) => {
            s.emit('turn_start', { game: getPlayerPerspective(session.game, id) })
        })
    }
}

function launchGame(session: GameSession): void {
    console.log("Lancement de game pour sockets", session.sockets.map(s => s.id));
    startTurn(session.game)
    session.timer = setTimeout(() => resolveRound(session), session.game.clock_per_turn * 1000)
    session.sockets.forEach((s, id) => {
        console.log(`Tentative d'émission 'game_start' vers ${s.id}`);
        s.emit('game_start', {
            game: getPlayerPerspective(session.game, id),
            playerIndex: id  // ✅
        })
})}

function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    // Parsing du deck
    let library: Card[] = []

    if (hero.deck) {
        const cardIds: string[] = JSON.parse(hero.deck)
        const cards = (await Promise.all(
            cardIds.map(id => prisma.card.findUnique({ where: { id } }))
        )).filter((c: Card | null): c is NonNullable<typeof c> => !!c)

        library = cards.map((c: typeof cards[0]): Card => ({
            kind: "card",
            idInGame: Math.floor(Math.random() * 100000),
            idInCollection: parseInt(c.id),
            cardName: c.name,
            effectText: c.effect_text ?? '',
            type: c.type as CardType,
            class: c.class as CardClass,
            runeCost: c.rune_cost,
            baseForce: c.force ?? 0,
            currForce: c.force ?? 0,
            baseEndurance: c.endurance ?? 0,
            currEndurance: c.endurance ?? 0,
            effect: c.effect,
            effects: JSON.parse(c.effect) as Effect[],
            zone: null as any,
            owner: null as any,
            timing: "normal" as EffectTime,
            state: "alive" as CreatureState,
            fullPicPath: c.illustration ?? '',
            smallPicPath: c.illustration ?? '',
            cardBackPath: ''
        }))
        library = shuffle(library);
    }
    return {
        kind: "hero",
        idInGame: Math.floor(Math.random() * 100000),
        class: hero.name as CardClass,
        passive: passiveEffect,
        armor: hero.base_armor,
        dmgDealt: 0,
        curRunes: 0,
        battlefield: {},
        library: library,
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
    for (const hero of heroes) {
        for (const card of hero.library) {
            card.owner = hero;
        }
    }

    return {
        kind: "game",
        phase: "beginning",
        turnNumber: 1,
        clock_per_turn: 60,
        players: heroes,
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
            console.log("Reçu play_card", { data });

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
            }
            else {
                const zone = data.zone as BfZone;
                if (session.game.players[playerIndex].battlefield[zone]) return; // slot occupé
                const alreadySubmitted = session.submittedCards.get(socket.id) ?? [];
                if (alreadySubmitted.some(({ payload }) => payload.zone === zone)) return; // déjà soumis ce tour

                const existing = session.submittedCards.get(socket.id) ?? [];
                existing.push({ card, payload:data });
                session.submittedCards.set(socket.id, existing);
                card.owner.hand = card.owner.hand.filter(c => c.idInGame !== card.idInGame);

            }
            const perspective = getPlayerPerspective(session.game, playerIndex);
            console.log('Émission game_update à', socket.id)  // ✅
            socket.emit('game_update', { game: perspective });

        })

        socket.on('end_turn', () => {
            console.log('Reçu end_turn de', socket.id)
            const session = sessions.find(s =>
                s.sockets.some(sock => sock.id === socket.id)
            )
            if (!session) return
            console.log('Session trouvée pour end_turn:', session.sockets.map(s => s.id))  // ✅
            session.readyPlayers.add(socket.id)
            console.log('Joueurs prêts:', Array.from(session.readyPlayers))  // ✅
            if (session.readyPlayers.size === session.sockets.length){
                resolveRound(session)
                session.sockets.forEach((s, id) => {
                    const perspective = getPlayerPerspective(session.game, id);
                    s.emit('game_update', { game: perspective });
                });

            }
        })

        socket.on('disconnect', () => {
            console.log('Joueur déconnecté :', socket.id)
        })
    })
}

function getPlayerPerspective(game: Game, playerIndex: number) {
    const copy = JSON.parse(JSON.stringify(game, (key, value) => {
        if (key === 'owner') return undefined  // ✅ ignore owner to avoid circular reference
        return value
    }));
    copy.players.forEach((hero: any, index: number) => {
        if (index !== playerIndex) {
            hero.hand = hero.hand.map(() => ({ idInGame: -1, hidden: true }))
            hero.libraryCount = hero.library.length
            hero.library = [];
        }
    });
    return copy;
}

import { Server, Socket } from 'socket.io'
import type { Game, Hero, Card, GameSession, WaitingPlayer, BfZone } from '../types.ts'
import { startTurn, checkVictory, resolveCombat, resolveBuildings, checkBoardState, playCard } from '../engine.ts'

const waitingPlayers: Record<number, WaitingPlayer[]> = {
    2: [],
    3: [],
    4: []
}

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

            playCard(card, zone, target, target2)
        }
    }

    checkBoardState(session.game)
    resolveBuildings(session.game)
    checkBoardState(session.game)
    resolveCombat(session.game)
    checkBoardState(session.game)

    session.submittedCards.clear()
    session.readyPlayers.clear()
    session.game.turnNumber += 1

    if (session.game.turnNumber > 8) {
        checkVictory(session.game)
        session.sockets.forEach(s => s.emit('game_over', { game: session.game }))
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

function buildHero(heroId: string): Hero {
    // TODO: aller chercher le héros en DB
    return {
        kind: "hero",
        idInGame: Math.floor(Math.random() * 100000),
        class: "Warrior",
        passive: { effect: "armor", value: 1, target: "self_hero" },
        armor: 0,
        dmgDealt: 0,
        curRunes: 0,
        battlefield: {},
        library: [],
        graveyard: [],
        hand: [],
        heroPicPath: "warrior.png"
    }
}

function instantiateGame(players: WaitingPlayer[]): Game {
    return {
        kind: "game",
        phase: "beginning",
        turnNumber: 1,
        clock_per_turn: 60,
        players: players.map(p => buildHero(p.playerData.heroId)),
        backgroundPath: "default.png"
    }
}

export function initSocket(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log('Joueur connecté :', socket.id)

        socket.on('join_game', (data) => {
            waitingPlayers[data.mode].push({
                socket: socket,
                playerData: data
            })
            if (waitingPlayers[data.mode].length === data.mode) {
                const players = waitingPlayers[data.mode]
                const newSession: GameSession = {
                    game: instantiateGame(players),
                    sockets: players.map(p => p.socket),
                    submittedCards: new Map<string, any[]>(),
                    readyPlayers: new Set<string>(),
                    timer: null
                }
                sessions.push(newSession)
                waitingPlayers[data.mode] = []
                launchGame(newSession)
            }
        })

        socket.on('play_card', (data) => {
            const session = sessions.find(s =>
                s.sockets.some(sock => sock.id === socket.id)
            )
            if (!session) return

            const existing = session.submittedCards.get(socket.id) ?? []
            existing.push(data)
            session.submittedCards.set(socket.id, existing)
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

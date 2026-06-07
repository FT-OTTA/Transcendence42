// routes/gameResults.ts
import { Router } from 'express';
import { prisma } from '../../prisma/prisma.ts';

const router = Router();

router.get('/history/:username', async (req, res) => {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const results = await prisma.gameResult.findMany({
        where: {
            OR: [
                { winnerId: user.id },
                { loserId: user.id },
                { player1Id: user.id },
                { player2Id: user.id },
            ]
        },
        include: { winner: true, loser: true, player1: true, player2: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    const formatted = results.map((r: any) => {
        const isDraw = r.winnerId === null;
        const isWin = r.winnerId === user.id;
        const isP1 = r.player1Id === user.id;
        const opponent = isDraw
            ? (isP1 ? r.player2?.username : r.player1?.username)
            : (isWin ? r.loser?.username : r.winner?.username);
        const heroClass = isP1 ? r.player1Class : r.player2Class;
        const opponentClass = isP1 ? r.player2Class : r.player1Class;
        const myScore = isP1 ? r.player1Score : r.player2Score;
        const theirScore = isP1 ? r.player2Score : r.player1Score;
        return {
            opponent,
            result: isDraw ? 'draw' : (isWin ? 'win' : 'loss'),
            turns: r.turns,
            heroClass,
            opponentClass,
            score: `${myScore} - ${theirScore}`,
        };
    });
    res.json(formatted);
});

export default router;
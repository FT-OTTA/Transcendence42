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
        const opponent = isDraw
            ? (r.player1Id === user.id ? r.player2?.username : r.player1?.username)
            : (isWin ? r.loser?.username : r.winner?.username);
        const heroClass = r.player1Id === user.id ? r.player1Class : r.player2Class;
        const oppoClass = r.player1Id === user.id ? r.player2Class : r.player1Class;
        return {
            opponent,
            result: isDraw ? 'draw' : (isWin ? 'win' : 'loss'),
            turns: r.turns,
            heroClass,
            oppoClass,
            score: `${r.scorep1} - ${r.scorep2}`
        };
    });
    res.json(formatted);
});

export default router;
// routes/gameResults.ts
import { Router } from 'express';
import { prisma } from '../../prisma/prisma.ts';

const router = Router();

router.get('/history/:username', async (req, res) => {
    console.log('HISTORY ROUTE HIT', req.params.username);

    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const results = await prisma.gameResult.findMany({
        where: { OR: [{ winnerId: user.id }, { loserId: user.id }] },
        include: { winner: true, loser: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    const formatted = results.map((r: any) => {
        const isWin = r.winnerId === user.id;
        const isDraw = r.winnerId === null;
        return {
            opponent: isDraw ? '?' : (isWin ? r.loser?.username : r.winner?.username),
            result: isDraw ? 'draw' : (isWin ? 'win' : 'loss'),
            turns: r.turns,
        };
    });

    res.json(formatted);
});

export default router;
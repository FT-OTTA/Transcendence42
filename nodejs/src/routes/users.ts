import { Router } from 'express'
import { prisma } from '../../prisma/prisma.ts'

const router = Router()


router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                createdAt: true,
            }
        })
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récup des users" })
    }
});

router.get('/:username', async (req, res) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user)
    {
        return res.status(404).json({

        });
    }

    return res.json(user);
});

export default router

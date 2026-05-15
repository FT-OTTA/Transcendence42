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
})

export default router

import { Router } from 'express'
import { prisma } from '../../prisma/prisma.ts'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const cards = await prisma.card.findMany()
        res.json(cards)
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des cartes" })
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const card = await prisma.card.findUnique({
            where: { id: id }
        })

        if (!card) {
            res.status(404).json({ error: 'Carte introuvable' })
            return
        }

        res.json(card)
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" })
    }
})

export default router
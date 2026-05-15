import { Router } from 'express'
import { prisma } from '../../prisma/prisma.ts'

const router = Router()

// GET /heroes — toutes les cartes
router.get('/', async (req, res) => {

    try {
        const heroes = await prisma.hero.findMany();
        res.json(heroes);
    }
    catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des heros" })
    }
})

// GET /heroes/:id — une carte par id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const hero = await prisma.hero.findUnique({
            where: {id: id}
        })
        if (!hero){
            res.status(404).json({ error: 'Heros introuvable' })
            return
        }
        res.json(hero)
    }
    catch (error) {
            res.status(500).json({ error: 'Erreur serveur' })

    }
})

export default router
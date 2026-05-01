import { Router } from 'express'
import { connection } from '../server.ts'

const router = Router()

// GET /cards — toutes les cartes
router.get('/', async (req, res) => {
    const [rows] = await connection.query('SELECT * FROM cards')
    res.json(rows)
})

// GET /cards/:id — une carte par id
router.get('/:id', async (req, res) => {
    const [rows] = await connection.query(
        'SELECT * FROM cards WHERE id = ?',
        [req.params.id]
    ) as any[]

    if (rows.length === 0) {
        res.status(404).json({ error: 'Carte introuvable' })
        return
    }

    const card = rows[0]

    // Récupère les effets associés
    const [effects] = await connection.query(
        'SELECT * FROM card_effects WHERE card_id = ?',
        [req.params.id]
    )

    res.json({ ...card, effects })
})

export default router
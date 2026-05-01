import { Router } from 'express'
import { connection } from '../server.ts'
import fs from 'fs'


const router = Router()

// GET /heroes — toutes les cartes
router.get('/', async (req, res) => {
    const [rows] = await connection.query('SELECT * FROM heroes')
    res.json(rows)
})

// GET /heroes/:id — une carte par id
router.get('/:id', async (req, res) => {
    const [rows] = await connection.query(
        'SELECT * FROM heroes WHERE id = ?',
        [req.params.id]
    ) as any[]

    if (rows.length === 0) {
        res.status(404).json({ error: 'Heros introuvable' })
        return
    }

    const hero = rows[0]

    const passivePath = `/app/databases/heroes/passives/${hero.passive_json_path}`
    const passive = JSON.parse(fs.readFileSync(passivePath, 'utf-8'))

    res.json({ ...hero, passive })
})

export default router
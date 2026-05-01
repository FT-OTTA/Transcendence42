import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { connection } from '../server.ts'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme'
const SALT_ROUNDS = 10

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({ error: 'Username et password requis' })
        return
    }

    // Vérifier si le username existe déjà
    const [existing] = await connection.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
    ) as any[]

    if (existing.length > 0) {
        res.status(409).json({ error: 'Username déjà pris' })
        return
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Insérer l'utilisateur
    const [result] = await connection.execute(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash]
    ) as any[]

    const token = jwt.sign(
        { userId: result.insertId, username },
        JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.status(201).json({ token, username })
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({ error: 'Username et password requis' })
        return
    }

    // Chercher l'utilisateur
    const [rows] = await connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
    ) as any[]

    if (rows.length === 0) {
        res.status(401).json({ error: 'Identifiants incorrects' })
        return
    }

    const user = rows[0]

    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
        res.status(401).json({ error: 'Identifiants incorrects' })
        return
    }

    const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.json({ token, username: user.username })
})

// Middleware pour vérifier le JWT sur les routes protégées
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization
    if (!header) {
        res.status(401).json({ error: 'Token manquant' })
        return
    }

    const token = header.replace('Bearer ', '')
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        ;(req as any).user = decoded
        next()
    } catch {
        res.status(401).json({ error: 'Token invalide' })
    }
}

export default router
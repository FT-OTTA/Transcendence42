import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../prisma/prisma.ts'
const router = Router()

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme'
const SALT_ROUNDS = 10

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: 'Username et password requis' })
    }

    try {
        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

        // Créer l'utilisateur 
        // Note: Prisma lève une erreur si le username (unique) existe déjà
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash
            }
        })

        const token = jwt.sign(
            { userId: user.id, username: username },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(201).json({ token, username: username })
    } catch (error: any) {
        // Gestion spécifique de l'erreur "Unique constraint failed" de Prisma (P2002)
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Username déjà pris' })
        }
        res.status(500).json({ error: 'Erreur lors de la création du compte' })
    }
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: 'Username et password requis' })
    }

    try {
        // Chercher l'utilisateur par son champ unique
        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects' })
        }

        // Vérifier le mot de passe
        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) {
            return res.status(401).json({ error: 'Identifiants incorrects' })
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({ token, username: user.username })
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// Middleware pour vérifier le JWT (reste quasiment le même)
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
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { initSocket } from './socket/game.ts'
import { prisma } from '../prisma/prisma.ts'

import cardsRouter from './routes/cards.ts'
import heroesRouter from './routes/heroes.ts'
import authRouter from './routes/auth.ts'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: "*" } })

// PLUS BESOIN de mysql.createConnection ici ! 
// Prisma gère la connexion tout seul dès que tu fais ton premier appel.
console.log('Prisma Engine prêt ✅')

app.use(express.json())

app.use('/cards', cardsRouter)
app.use('/heroes', heroesRouter)
app.use('/auth', authRouter)

// Ta route users migrée sur Prisma
app.get('/users', async (req, res) => {
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

app.get('/', (req, res) => {
    res.send('TCG Dev Edition — API OK (Powered by Prisma) ✅')
})

initSocket(io)

httpServer.listen(3000, () => {
    console.log('Server running on port 3000')
})
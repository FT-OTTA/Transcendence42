import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { initSocket } from './socket/index.ts'
import { prisma } from '../prisma/prisma.ts'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from "url";

import cardsRouter from './routes/cards.ts'
import heroesRouter from './routes/heroes.ts'
import authRouter from './routes/auth.ts'
import usersRouter from './routes/users.ts'
import friendRouter from './routes/friends.ts'
import roomRouter from './routes/rooms.ts'
import messageRouter from './routes/messages.ts'

const app = express()
// app.use(cors({ origin: '*' }))
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: "*" } })

// PLUS BESOIN de mysql.createConnection ici !
// Prisma gère la connexion tout seul dès que tu fais ton premier appel.
console.log('Prisma Engine prêt ✅')

app.use(cors({
    origin: "${BACK_PUBLIC_API_URL}",
    credentials: true,
}));

app.use(express.json())

app.use('/cards', cardsRouter)
app.use('/heroes', heroesRouter)
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/friends', friendRouter)
app.use('/rooms', roomRouter)
app.use('/messages', messageRouter)

app.get('/', (req, res) => {
    res.send('TCG Dev Edition — API OK (Powered by Prisma) ✅')
})

initSocket(io)
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("listening");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


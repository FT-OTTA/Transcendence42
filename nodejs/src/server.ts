import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import next from 'next'
import { initSocket } from './socket/index.ts'
import { prisma } from '../prisma/prisma.ts'
import cors from 'cors'

import cardsRouter from './routes/cards.ts'
import heroesRouter from './routes/heroes.ts'
import authRouter from './routes/auth.ts'
import usersRouter from './routes/users.ts'
import friendRouter from './routes/friends.ts'
import roomRouter from './routes/rooms.ts'
import messageRouter from './routes/messages.ts'

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev, dir: './front' })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const app = express()
  const httpServer = createServer(app)
  const io = new Server(httpServer, { cors: { origin: "*" } })

  console.log('Prisma Engine prêt ✅')

  app.use(cors({ origin: "*", credentials: true }))
  app.use(express.json())

  app.use('/cards', cardsRouter)
  app.use('/heroes', heroesRouter)
  app.use('/auth', authRouter)
  app.use('/users', usersRouter)
  app.use('/friends', friendRouter)
  app.use('/rooms', roomRouter)
  app.use('/messages', messageRouter)

  // Next.js gère tout le reste — doit être EN DERNIER  
  app.all('/{*path}', (req, res) => handle(req, res))

  initSocket(io)
  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => console.log(`Server on ${PORT} ✅`))
}).catch( (err) =>
    console.error('Next.js prepare() failed:', err)
  )
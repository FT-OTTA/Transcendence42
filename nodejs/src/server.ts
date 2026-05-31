import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { initSocket } from './socket/index.ts'
import { prisma } from '../prisma/prisma.ts'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import cardsRouter from './routes/cards.ts'
import heroesRouter from './routes/heroes.ts'
import authRouter from './routes/auth.ts'
import usersRouter from './routes/users.ts'
import friendRouter from './routes/friends.ts'
import roomRouter from './routes/rooms.ts'
import messageRouter from './routes/messages.ts'
import avatarRouter from './routes/avatar.ts'
import historyRouter from './routes/history.ts'
import { register, httpRequestsTotal, httpRequestDuration, activeConnections } from './routes/metrics.ts'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        origin: '*',
        credentials: true,
        methods: ["GET", "POST"],
    },
})

console.log('Prisma Engine prêt ✅')

app.use(cors({
    origin: "*"
    origin: "*"
}));

app.use(express.json());
app.use(fileUpload());


// ─── Middleware métriques (avant toutes les routes) ───────────────
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer()
    res.on('finish', () => {
        const route = req.route?.path ?? req.path
        httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode })
        end({ method: req.method, route, status: res.statusCode })
    })
    next()
})
// ─────────────────────────────────────────────────────────────────
app.use('/illustrations', express.static('/app/databases/illustrations'));
app.use('/avatars', express.static('/app/databases/users/avatars'))
app.use('/cards', cardsRouter)
app.use('/heroes', heroesRouter)
app.use('/auth', authRouter)
app.use('/users', historyRouter)
console.log('historyRouter registered')
app.use('/users', usersRouter)
app.use('/friends', friendRouter)
app.use('/rooms', roomRouter)
app.use('/messages', messageRouter)
app.use('/users', avatarRouter)

// ─── Endpoint Prometheus ──────────────────────────────────────────

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})
// ─────────────────────────────────────────────────────────────────

app.use((req, res, next) => {
    console.log("REQ:", req.url)
    next()
})

// ─── Socket.IO ────────────────────────────────────────────────────
io.on('connection', (socket) => {
    activeConnections.inc()
    socket.on('disconnect', () => activeConnections.dec())
})
// ─────────────────────────────────────────────────────────────────

initSocket(io)

httpServer.listen(3000, () => {
    console.log('Server running on port 3000')
})
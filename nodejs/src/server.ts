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

const app = express()
// app.use(cors({ origin: '*' }))
const httpServer = createServer(app)
const io = new Server(httpServer, { 
    cors: {
        origin: "/",
        credentials: true,
        methods: ["GET", "POST"],        
    }, 
});

// PLUS BESOIN de mysql.createConnection ici !
// Prisma gère la connexion tout seul dès que tu fais ton premier appel.
console.log('Prisma Engine prêt ✅')

app.use(cors({
    origin: "/",
    credentials: true,
}));

app.use(express.json());
app.use(fileUpload());
app.use('/api/avatars', express.static('/app/databases/users/avatars'));
app.use('/api/cards', cardsRouter);
app.use('/api/heroes', heroesRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/friends', friendRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/messages', messageRouter);
app.use('/api/users', avatarRouter);
app.get('/api', (req, res) => {
    res.send('TCG Dev Edition — API OK (Powered by Prisma) ✅')
})
app.use((req, res, next) => {
	console.log("REQ:", req.url);
	next();
});
initSocket(io)

httpServer.listen(3000, () => {
    console.log('Server running on port 3000')
})

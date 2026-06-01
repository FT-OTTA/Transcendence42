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

const app = express()
// app.use(cors({ origin: '*' }))
const httpServer = createServer(app)
const io = new Server(httpServer, { 
    cors: {
        origin: "http://localhost:3001",
        credentials: true,
        methods: ["GET", "POST"],        
    }, 
});

// PLUS BESOIN de mysql.createConnection ici !
// Prisma gère la connexion tout seul dès que tu fais ton premier appel.
console.log('Prisma Engine prêt ✅')

app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
}));

app.use(express.json());
app.use(fileUpload());
app.use('/avatars', express.static('/app/databases/users/avatars'));
app.use('/cards', cardsRouter);
app.use('/heroes', heroesRouter);
app.use('/auth', authRouter);
app.use('/users', historyRouter);
console.log('historyRouter registered');

app.use('/users', usersRouter);
app.use('/friends', friendRouter);
app.use('/rooms', roomRouter);
app.use('/messages', messageRouter);
app.use('/users', avatarRouter);
app.get('/', (req, res) => {
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

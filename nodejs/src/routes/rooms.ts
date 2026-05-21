import { Router } from "express"
import { prisma } from "../../prisma/prisma.ts"

const router = Router()

async function requireUser(username: string | undefined) {
    if (!username) return null;

    return prisma.user.findUnique({
        where: { username }
    });
}

router.get("/", async (_, res) => {

    const rooms = await prisma.room.findMany({
        include: {
            player1: true,
            player2: true,
        },
        orderBy: {
            id: "asc"
        }
    })

    return res.json(rooms)
})

router.post("/create", async (req, res) => {
    const { username } = req.body;

    const user = await requireUser(username);

    if (!user) {
        return res.status(401).json({
            error: "You must be logged in to create a room"
        });
    }

    const room = await prisma.room.create({
        data: {
            player1Id: user.id,
            status: "waiting",
        }
    });

    return res.json(room);
});

router.post("/:id/join", async (req, res) => {

    const { username } = req.body
    const roomId = Number(req.params.id)

    const user = await requireUser(username);

    if (!user) {
        return res.status(401).json({
            error: "You must be logged in to join a room"
        });
    }

    const room = await prisma.room.findUnique({
        where: {
            id: roomId
        }
    })

    if (!room) {
        return res.status(404).json({
            error: "Room not found"
        })
    }

    if (room.player1Id === user.id) {
        return res.status(403).json({
            error: "Player already in room"
        })
    }

    if (room.player2Id) {
        return res.status(403).json({
            error: "Room already full"
        })
    }

    const updatedRoom = await prisma.room.update({
        where: {
            id: roomId
        },
        data: {
            player2Id: user.id,
            status: "playing"
        }
    })

    return res.json(updatedRoom)
})

export default router

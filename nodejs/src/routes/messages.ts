import { Router } from "express"
import { prisma } from "../../prisma/prisma.ts"

const router = Router()

async function requireUser(username: string | undefined) {
    if (!username) return null;

    return prisma.user.findUnique({
        where: { username }
    });
}

router.get("/global", async (_, res) => {

    const messages = await prisma.message.findMany({
        where: {
            roomId: null,
        },
        include: {
            sender: true,
        },
        orderBy: {
            createdAt: "asc"
        },
    });

    return res.json(messages);

});

router.get("/room/:id", async (req, res) => {

    const roomId = Number(req.params.id);

    const messages = await prisma.message.findMany({
        where: {
            roomId
        },
        include: {
            sender: true,
        },
        orderBy: {
            createdAt: "asc"
        },
    });

    return res.json(messages);

});
/*
router.post("/", async (req, res) => {
    const { username, content, roomId } = req.body;

    if (!username || !content?.trim()) {
        return res.status(400).json({ error: "Invalid message" });
    }

    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const message = await prisma.message.create({
        data: {
            senderId: user.id,
            content: content.trim(),
            roomId: roomId ?? null,
        }
    });

    return res.json(message);
}); */

export default router

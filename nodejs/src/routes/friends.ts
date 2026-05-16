import { Router } from 'express'
import type { Request, Response } from 'express'
import { prisma } from '../../prisma/prisma.ts'

const router = Router()

router.post('/add', async (req: Request, res: Response) => {
    const { username, friendUsername } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        })

        const friend = await prisma.user.findUnique({
            where: { username: friendUsername }
        })

        if (!user || !friend) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        if (user.id === friend.id) {
            return res.status(400).json({
                error: "Cannot add yourself"
            })
        }

        await prisma.friendship.create({
            data: {
                userId: user.id,
                friendId: friend.id,
            },
        })

        return res.json({
            success: true
        })

    } catch (error: any) {
//tried to insert a row that violates a UNIQUE constraint aka friend already added 
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: "Friend already added"
            })
        }

        console.error(error)

        return res.status(500).json({
            error: "Server error"
        })
    }
})

router.get("/:username", async (req, res) => {
    const { username } = req.params

    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    const friendships = await prisma.friendship.findMany({
        where: {
            userId: user.id,
        },
        include: {
            friend: true,
        },
    })

    return res.json(friendships)
})

export default router
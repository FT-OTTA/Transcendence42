import { Router } from 'express'
import { prisma } from '../../prisma/prisma.ts'

const router = Router()


router.get('/', async (req, res) => {
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
});

router.get('/:username', async (req, res) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user)
    {
        return res.status(404).json({

        });
    }

    return res.json(user);
});

router.patch('/:login', async (req, res) => {
	try {
		const { login } = req.params;
		const { moodphrase } = req.body;

		if (!moodphrase)
        {
			return res.status(400).json({ error: "moodPhrase is required" });
		}

        if (moodphrase.length() > 100)
        {
            return res.status(413).json({ error: "moodPhrase too long"});
        }

		const updatedUser = await prisma.user.update({
			where: {
				username: login,
			},
			data: {
				moodphrase: moodphrase,
			},
		});

		return res.json(updatedUser);

	} catch (error) {
		console.error(error);

		return res.status(500).json({
			error: "Error while updating moodPhrase" + error,
		});
	}
});

export default router

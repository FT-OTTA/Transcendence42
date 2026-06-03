import { Router } from 'express'
import { prisma } from '../../prisma/prisma.ts'
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import sharp from "sharp";

const router = Router()

router.post('/api/:login/avatar', async (req, res) => {
	try 
	{
		const { login } = req.params;
		const file = req.files?.avatar;
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		console.log("FILES:", req.files);

		if (!file)
		{
			return res.status(400).json({error : "No file uploaded" });
		}

		const filename = `${login}.png`;
		const folder = path.join(process.cwd(), "/api/databases/users/avatars");

		fs.mkdirSync( folder, { recursive: true });

		const outputPath = path.join(folder, filename);

		await sharp(file.data)
			.resize(128,128)
			.png()
			.toFile(outputPath);

		await prisma.user.update({
			where: {username: login },
			data: {avatarUrl: `/api/avatars/${filename}`},
		});
	} 
	catch (err)
	{
		console.error("UPLOAD ERROR:", err);
		return res.status(500).json({ error: "upload failed" });
	}
	return res.json({ ok: true});
});

export default router;
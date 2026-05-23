import { Router } from 'express'
import { prisma } from '../../prisma/prisma.ts'
import * as client from 'prom-client';

const router = Router()

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

router.get('/', async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

export default router
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

app.use(pinoHttp({ logger }));

app.use(cors());
app.use(express.json());

app.use('/api/v1', orderRoutes);

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', message: 'AI agent running!' });
});

export default app;
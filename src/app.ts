import express, { type Request, type Response } from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', orderRoutes);

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', message: 'AI agent running!' });
});

export default app;
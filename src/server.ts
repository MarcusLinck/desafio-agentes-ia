import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.use('/api/v1', orderRoutes);

app.get('/health', (req: Request, res: Response) => {
  return res.json({ status: 'ok', message: 'Agente IA rodando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
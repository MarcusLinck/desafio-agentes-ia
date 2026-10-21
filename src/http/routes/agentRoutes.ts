import { Router } from 'express';
import { handleAgentChat } from '../controllers/agentController';

const router = Router();

router.post('/chat', handleAgentChat);

export default router;
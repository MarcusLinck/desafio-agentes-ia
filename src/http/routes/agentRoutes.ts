import { Router } from 'express';
import { handleAgentChat } from '../controllers/agentController.js';

const router = Router();

router.post('/chat', handleAgentChat);

export default router;
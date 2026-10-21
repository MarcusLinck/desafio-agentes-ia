import { Request, Response } from 'express';
import { supportAgent } from '../../agent';

export async function handleAgentChat(req: Request, res: Response) {
  try {
    const { threadId, message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'O campo "message" é obrigatório e deve ser uma string.' });
    }

    const result = await supportAgent.generate(message, {
      memory: {
        thread: threadId || 'default-thread',
        resource: threadId || 'default-customer',
      },
    });

    return res.status(200).json({
      success: true,
      response: result.text,
    });
  } catch (error: any) {
    console.error('Erro ao processar mensagem com o agente:', {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });

    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro interno ao processar a mensagem com o agente de IA.',
    });
  }
}
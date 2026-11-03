import { Request, Response } from 'express';
import { supportAgent } from '../../agent/index.js';
import { agentChatBodySchema } from '../../validators/product.validator.js';

export async function handleAgentChat(req: Request, res: Response) {
  const validationResult = agentChatBodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Dados de entrada inválidos',
      message: validationResult.error.issues[0]?.message,
    });
  }

  const { message, sessionId } = validationResult.data;

  try {
    const result = await supportAgent.generate(message, {
      memory: {
        thread: sessionId || 'default-thread',
        resource: sessionId || 'default-customer',
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
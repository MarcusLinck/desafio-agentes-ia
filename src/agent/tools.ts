import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { logger } from '../lib/logger';
import { makeCancelOrderUseCase } from '../use-cases/factories/make-cancel-order-use-case';
import { makeGetOrderByIdUseCase } from '../use-cases/factories/make-get-order-by-id-use-case';
import { makeGetProductByIdUseCase } from '../use-cases/factories/make-get-product-by-id-use-case';

export const getOrderTool = createTool({
  id: 'get-order',
  description: 'Consulta o status e os detalhes completos de um pedido utilizando o seu ID.',
  inputSchema: z.object({
    orderId: z.string().describe('O ID UUID do pedido a ser consultado'),
  }),
  execute: async ({ orderId }) => {
    logger.info({ orderId }, 'Agente executou ferramenta: get-order');
    
    const getOrderByIdUseCase = makeGetOrderByIdUseCase();

    const order = await getOrderByIdUseCase.execute(orderId);

    if (!order) {
      logger.warn({ orderId }, 'Pedido não encontrado pela ferramenta do agente');
      return { success: false, message: 'Pedido não encontrado.' };
    }

    return { success: true, order };
  },
});

export const cancelOrderTool = createTool({
  id: 'cancel-order',
  description: 'Cancela um pedido existente. AVISO: Você SÓ DEVE usar esta ferramenta se o pedido estiver estritamente com o status "PROCESSING" E se o cliente tiver confirmado explicitamente a intenção de cancelamento.',
  inputSchema: z.object({ orderId: z.string() }),
  execute: async ({ orderId }) => {
    logger.info({ orderId }, 'Agente executou ferramenta: cancel-order');
    const cancelOrderUseCase = makeCancelOrderUseCase();
    const result = await cancelOrderUseCase.execute(orderId);
    return result;
  },
});

export const searchExternalProductsTool = createTool({
  id: 'search-external-product',
  description: 'OBRIGATÓRIO consultar esta ferramenta sempre que o usuário perguntar sobre categoria, descrição, preço oficial ou imagens de um produto. Utiliza o productId para buscar os dados atualizados diretamente na Fake Store API.',
  inputSchema: z.object({
    productId: z.number().int().positive().default(1).describe('ID numérico do produto (productId) a ser consultado na Fake Store API'),
  }),
  execute: async ({ productId }) => {
    logger.info({ productId }, 'Agente executou ferramenta externa: search-external-product');

    const getProductByIdUseCase = makeGetProductByIdUseCase();

    const product = await getProductByIdUseCase.execute(productId);

    if (!product) {
      return { success: false, message: 'Produto não encontrado na base externa.' };
    }

    return {
      success: true,
      product: product,
    };
  },
});
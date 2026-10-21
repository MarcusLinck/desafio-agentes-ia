import type { OrderRepository } from '../interfaces/order-repository';
import { logger } from '../lib/logger';
import type { OrderStatus } from '@prisma/client';
import { OrderNotFoundError } from './errors';

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(id: string, status: OrderStatus) {
    logger.info({ useCase: 'UpdateOrderStatusUseCase', orderId: id, status }, 'Executando caso de uso: Atualizar Status do Pedido');
    
    const order = await this.orderRepository.findById(id);
    
    if (!order) {
      throw new OrderNotFoundError(id);
    }
    
    return await this.orderRepository.updateStatus(id, status);
  }
}
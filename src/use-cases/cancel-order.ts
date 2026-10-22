import type { OrderRepository } from '../interfaces/order-repository.js';
import { logger } from '../lib/logger.js';
import { OrderNotFoundError, InvalidOrderStatusError } from './errors/index.js';

export class CancelOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(id: string) {
    logger.warn({ useCase: 'CancelOrderUseCase', orderId: id }, 'Executando caso de uso: Cancelar Pedido');

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    if (order.status !== 'PROCESSING') {
      throw new InvalidOrderStatusError(order.status);
    }

    return await this.orderRepository.updateStatus(id, 'CANCELLED');
  }
}
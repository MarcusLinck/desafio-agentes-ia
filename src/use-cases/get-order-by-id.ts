import type { OrderRepository } from '../interfaces/order-repository.js';
import { logger } from '../lib/logger.js';
import { OrderNotFoundError } from './errors/index.js';

export class GetOrderByIdUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(id: string) {
    logger.info({ useCase: 'GetOrderByIdUseCase', orderId: id }, 'Executando caso de uso: Obter Pedido por ID');
    const order = await this.orderRepository.findById(id);
    
    if (!order) {
      throw new OrderNotFoundError(id);
    }
    
    return order;
  }
}
import type { OrderRepository } from '../interfaces/order-repository';
import { logger } from '../lib/logger';

export class GetOrderByIdUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(id: string) {
    logger.info({ useCase: 'GetOrderByIdUseCase', orderId: id }, 'Executando caso de uso: Obter Pedido por ID');
    return await this.orderRepository.findById(id);
  }
}
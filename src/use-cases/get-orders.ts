import type { OrderRepository } from '../interfaces/order-repository';
import { logger } from '../lib/logger';

export class GetOrdersUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute() {
    logger.info({ useCase: 'GetOrdersUseCase' }, 'Executando caso de uso: Obter Lista de Pedidos');
    return await this.orderRepository.findAll();
  }
}
import type { OrderRepository } from '../interfaces/order-repository.js';
import { logger } from '../lib/logger.js';

export class GetOrdersUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute() {
    logger.info({ useCase: 'GetOrdersUseCase' }, 'Executando caso de uso: Obter Lista de Pedidos');
    return await this.orderRepository.findAll();
  }
}
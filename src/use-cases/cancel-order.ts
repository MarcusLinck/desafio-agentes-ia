import type { OrderRepository } from '../interfaces/order-repository';
import { logger } from '../lib/logger';

export class CancelOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(id: string) {
    logger.warn({ useCase: 'CancelOrderUseCase', orderId: id }, 'Executando caso de uso: Cancelar Pedido');

    const order = await this.orderRepository.findById(id);

    if (!order) {
      return { success: false, reason: 'NOT_FOUND' as const };
    }

    if (order.status !== 'PROCESSING') {
      return { success: false, reason: 'INVALID_STATUS' as const, currentStatus: order.status };
    }

    const updatedOrder = await this.orderRepository.updateStatus(id, 'CANCELLED');
    return { success: true, order: updatedOrder };
  }
}
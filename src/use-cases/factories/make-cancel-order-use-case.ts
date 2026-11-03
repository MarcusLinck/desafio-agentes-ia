import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import type { OrderRepository } from '../../interfaces/order-repository.js';
import { CancelOrderUseCase } from '../cancel-order.js';

export function makeCancelOrderUseCase(
  orderRepository?: OrderRepository
) {
  const repository = orderRepository || new PrismaOrderRepository();
  const cancelOrderUseCase = new CancelOrderUseCase(repository);

  return cancelOrderUseCase;
}
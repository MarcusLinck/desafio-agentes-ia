import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import type { OrderRepository } from '../../interfaces/order-repository.js';
import { UpdateOrderStatusUseCase } from '../update-order-status.js';

export function makeUpdateOrderStatusUseCase(
  orderRepository?: OrderRepository
) {
  const repository = orderRepository || new PrismaOrderRepository();
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(repository);

  return updateOrderStatusUseCase;
}
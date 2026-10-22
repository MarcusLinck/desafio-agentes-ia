import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import { UpdateOrderStatusUseCase } from '../update-order-status.js';

export function makeUpdateOrderStatusUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

  return updateOrderStatusUseCase;
}
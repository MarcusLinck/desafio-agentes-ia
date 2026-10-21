import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository';
import { UpdateOrderStatusUseCase } from '../update-order-status';

export function makeUpdateOrderStatusUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

  return updateOrderStatusUseCase;
}
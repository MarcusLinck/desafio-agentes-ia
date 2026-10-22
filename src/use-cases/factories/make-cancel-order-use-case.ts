import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import { CancelOrderUseCase } from '../cancel-order.js';

export function makeCancelOrderUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const cancelOrderUseCase = new CancelOrderUseCase(orderRepository);
  
  return cancelOrderUseCase;
}
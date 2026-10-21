import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository';
import { CancelOrderUseCase } from '../cancel-order';

export function makeCancelOrderUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const cancelOrderUseCase = new CancelOrderUseCase(orderRepository);
  
  return cancelOrderUseCase;
}
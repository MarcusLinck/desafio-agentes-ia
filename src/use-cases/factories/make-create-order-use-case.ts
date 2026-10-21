import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository';
import { CreateOrderUseCase } from '../create-order';

export function makeCreateOrderUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const createOrderUseCase = new CreateOrderUseCase(orderRepository);

  return createOrderUseCase;
}
import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import { CreateOrderUseCase } from '../create-order.js';

export function makeCreateOrderUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const createOrderUseCase = new CreateOrderUseCase(orderRepository);

  return createOrderUseCase;
}
import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import { GetOrdersUseCase } from '../get-orders.js';

export function makeGetOrdersUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const getOrdersUseCase = new GetOrdersUseCase(orderRepository);

  return getOrdersUseCase;
}
import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository';
import { GetOrdersUseCase } from '../get-orders';

export function makeGetOrdersUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const getOrdersUseCase = new GetOrdersUseCase(orderRepository);

  return getOrdersUseCase;
}
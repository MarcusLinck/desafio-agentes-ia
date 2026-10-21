import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository';
import { GetOrderByIdUseCase } from '../get-order-by-id';

export function makeGetOrderByIdUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);

  return getOrderByIdUseCase;
}
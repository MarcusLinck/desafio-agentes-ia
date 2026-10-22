import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import { GetOrderByIdUseCase } from '../get-order-by-id.js';

export function makeGetOrderByIdUseCase() {
  const orderRepository = new PrismaOrderRepository();
  const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);

  return getOrderByIdUseCase;
}
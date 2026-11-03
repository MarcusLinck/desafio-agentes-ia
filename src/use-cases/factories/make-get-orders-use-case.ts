import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import type { OrderRepository } from '../../interfaces/order-repository.js';
import { GetOrdersUseCase } from '../get-orders.js';

export function makeGetOrdersUseCase(
  orderRepository?: OrderRepository
) {
  const repository = orderRepository || new PrismaOrderRepository();
  const getOrdersUseCase = new GetOrdersUseCase(repository);

  return getOrdersUseCase;
}
import { PrismaOrderRepository } from '../../repositories/prismaOrderRepository.js';
import type { OrderRepository } from '../../interfaces/order-repository.js';
import { CreateOrderUseCase } from '../create-order.js';

export function makeCreateOrderUseCase(
  orderRepository?: OrderRepository
) {
  const repository = orderRepository || new PrismaOrderRepository();
  const createOrderUseCase = new CreateOrderUseCase(repository);

  return createOrderUseCase;
}
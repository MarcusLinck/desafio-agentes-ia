import { Order } from '@prisma/client';
import type { OrderRepository, CreateOrderInput } from '../interfaces/order-repository.js';
import { logger } from '../lib/logger.js';

export class CreateOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(data: CreateOrderInput & { totalAmount: number }): Promise<Order> {
    logger.info({ useCase: 'CreateOrderUseCase', customerName: data.customerName }, 'Executando caso de uso: Criar Pedido');

    const totalAmount = data.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const orderData = {
      ...data,
      totalAmount,
    };

    return await this.orderRepository.create(orderData);
  }
}
import type { Order, OrderStatus } from '@prisma/client';

export interface CreateOrderInput {
  customerName: string;
  items: Array<{
    productId: number;
    title: string;
    price: number;
    quantity: number;
  }>;
}

export interface OrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  create(data: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
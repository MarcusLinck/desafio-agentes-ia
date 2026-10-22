import { prisma } from '../lib/prisma.js';
import type { Order, OrderStatus } from '@prisma/client';
import type { OrderRepository, CreateOrderInput } from '../interfaces/order-repository.js';

export class PrismaOrderRepository implements OrderRepository {
  async findAll(): Promise<Order[]> {
    return await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

async create(data: CreateOrderInput & { totalAmount: number }): Promise<Order> {
    return await prisma.order.create({
      data: {
        customerName: data.customerName,
        status: 'PROCESSING',
        totalAmount: data.totalAmount,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }
}
import type { Order, OrderStatus } from '@prisma/client';
import type { OrderRepository, CreateOrderInput } from '../../src/interfaces/order-repository';

interface OrderWithItems extends Order {
  items: Array<{
    id: string;
    orderId: string;
    productId: number;
    title: string;
    price: number;
    quantity: number;
  }>;
}

export class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, OrderWithItems> = new Map();

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async create(data: CreateOrderInput & { totalAmount: number }): Promise<Order> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newOrder: OrderWithItems = {
      id,
      customerName: data.customerName,
      totalAmount: data.totalAmount,
      status: 'PROCESSING',
      createdAt: now,
      updatedAt: now,
      items: data.items.map((item, index) => ({
        id: `${id}-item-${index}`,
        orderId: id,
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const updatedOrder: OrderWithItems = {
      ...order,
      status,
      updatedAt: new Date(),
    };

    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  clear(): void {
    this.orders.clear();
  }

  seed(order: OrderWithItems): void {
    this.orders.set(order.id, order);
  }
}
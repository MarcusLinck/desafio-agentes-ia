import { PrismaClient, OrderStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Conectando ao banco de dados e populando dados iniciais com UUIDs...');

  try {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  } catch (e) {
    console.log('Tabelas ainda não existem ou já estão vazias.');
  }

  const order1 = await prisma.order.create({
    data: {
      id: randomUUID(),
      customerName: 'Marcus Linck',
      status: OrderStatus.PROCESSING,
      totalAmount: 109.95,
      items: {
        create: [
          {
            productId: 1,
            title: 'Fjallraven - Foldsack No. 1 Backpack',
            price: 109.95,
            quantity: 1,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      id: randomUUID(),
      customerName: 'Mateus Ferraz',
      status: OrderStatus.PROCESSING,
      totalAmount: 46.00,
      items: {
        create: [
          {
            productId: 2,
            title: 'Mens Casual Premium Slim Fit T-Shirts',
            price: 23.00,
            quantity: 2,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      id: randomUUID(),
      customerName: 'Ana Souza',
      status: OrderStatus.SHIPPED,
      totalAmount: 55.99,
      items: {
        create: [
          {
            productId: 3,
            title: 'Mens Cotton Jacket',
            price: 55.99,
            quantity: 1,
          },
        ],
      },
    },
  });

  const order4 = await prisma.order.create({
    data: {
      id: randomUUID(),
      customerName: 'Carlos Silva',
      status: OrderStatus.DELIVERED,
      totalAmount: 15.99,
      items: {
        create: [
          {
            productId: 4,
            title: 'Mens Casual Slim Fit',
            price: 15.99,
            quantity: 1,
          },
        ],
      },
    },
  });

  const order5 = await prisma.order.create({
    data: {
      id: randomUUID(),
      customerName: 'Fernanda Lima',
      status: OrderStatus.CANCELLED,
      totalAmount: 114.00,
      items: {
        create: [
          {
            productId: 5,
            title: 'John Hardy Women s Legends Naga Gold & Silver Dragon Station Chain Bracelet',
            price: 695.00,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log('✅ Banco populado com sucesso com 5 registros!', {
    order1,
    order2,
    order3,
    order4,
    order5,
  });
}

main()
  .catch((e) => {
    console.error('Erro ao popular banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
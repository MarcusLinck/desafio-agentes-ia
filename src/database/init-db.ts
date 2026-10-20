import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Conectando ao banco de dados e populando dados iniciais...');

  // Limpa dados anteriores se houver
  try {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  } catch (e) {
    console.log('Tabelas ainda não existem. Criando via código...');
  }

  // Cria um pedido de teste em processamento
  const order1 = await prisma.order.create({
    data: {
      id: 'pedido-1001',
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

  // Cria um pedido já enviado (não cancelável)
  const order2 = await prisma.order.create({
    data: {
      id: 'pedido-1002',
      customerName: 'Ana Souza',
      status: OrderStatus.SHIPPED,
      totalAmount: 45.0,
      items: {
        create: [
          {
            productId: 2,
            title: 'Mens Casual Premium Slim Fit T-Shirts',
            price: 22.5,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log('✅ Banco populado com sucesso!', { order1, order2 });
}

main()
  .catch((e) => {
    console.error('Erro ao popular banco:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
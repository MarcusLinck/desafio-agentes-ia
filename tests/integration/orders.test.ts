import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Orders API Integration Tests', () => {

  beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });


  it('should successfully create a new order and correctly calculate the total', async () => {
    const payload = {
      customerName: 'Cliente Teste',
      items: [
        {
          productId: 1,
          title: 'Produto Teste A',
          price: 50.0,
          quantity: 2,
        },
        {
          productId: 2,
          title: 'Produto Teste B',
          price: 25.5,
          quantity: 2,
        },
      ],
    };

    const response = await request(app).post('/api/v1/orders').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.customerName).toBe('Cliente Teste');
    expect(response.body.data.totalAmount).toBe(151.0);
    expect(response.body.data.status).toBe('PROCESSING');
    expect(response.body.data.items).toHaveLength(2);
  });

  it('should return a 400 error when attempting to create an order without the customers name', async () => {
    const payload = {
      items: [
        {
          productId: 1,
          title: 'Produto Teste',
          price: 50.0,
          quantity: 1,
        },
      ],
    };

    const response = await request(app).post('/api/v1/orders').send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Dados inválidos');
  });

  it('should return a 400 error when attempting to create an order without items', async () => {
    const payload = {
      customerName: 'Cliente Sem Itens',
      items: [],
    };

    const response = await request(app).post('/api/v1/orders').send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Dados inválidos');
  });

  it('should return a 500 error if an internal error occurs while creating the order', async () => {
    const spy = vi.spyOn(prisma.order, 'create').mockRejectedValueOnce(new Error('Erro de conexão com o banco'));

    const payload = {
      customerName: 'Cliente Erro 500',
      items: [
        {
          productId: 1,
          title: 'Produto Teste',
          price: 50.0,
          quantity: 1,
        },
      ],
    };

    const response = await request(app).post('/api/v1/orders').send(payload);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro técnico');
    expect(response.body).toHaveProperty('message', 'Ocorreu um erro interno ao tentar criar o pedido.');

    spy.mockRestore();
  });

  it('should return an empty list of orders when there are no records', async () => {
    const response = await request(app).get('/api/v1/orders');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.total).toBe(0);
    expect(response.body.data).toEqual([]);
  });

  it('should list all orders sorted by date in descending order', async () => {
    await prisma.order.create({
      data: {
        customerName: 'Cliente 1',
        totalAmount: 10,
        status: 'PROCESSING',
      },
    });

    await prisma.order.create({
      data: {
        customerName: 'Cliente 2',
        totalAmount: 20,
        status: 'PROCESSING',
      },
    });

    const response = await request(app).get('/api/v1/orders');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.total).toBe(2);
    expect(response.body.data[0].customerName).toBe('Cliente 2');
  });

  it('should successfully fetch a specific order by ID', async () => {
    const createdOrder = await prisma.order.create({
      data: {
        customerName: 'Cliente Específico',
        totalAmount: 150.0,
        status: 'PROCESSING',
        items: {
          create: [
            {
              productId: 99,
              title: 'Item Único',
              price: 150.0,
              quantity: 1,
            },
          ],
        },
      },
    });

    const response = await request(app).get(`/api/v1/orders/${createdOrder.id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(createdOrder.id);
    expect(response.body.data.customerName).toBe('Cliente Específico');
    expect(response.body.data.items).toHaveLength(1);
  });

  it('should return a 404 error if the order with the specified ID does not exist', async () => {
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app).get(`/api/v1/orders/${fakeUuid}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Pedido não encontrado');
  });

  it('should successfully update the status of an order', async () => {
    const createdOrder = await prisma.order.create({
      data: {
        customerName: 'Cliente para Atualizar',
        totalAmount: 80.0,
        status: 'PROCESSING',
      },
    });

    const response = await request(app)
      .patch(`/api/v1/orders/${createdOrder.id}/status`)
      .send({ status: 'DELIVERED' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('DELIVERED');
  });

  it('should return a 400 error when attempting to update to an invalid status', async () => {
    const createdOrder = await prisma.order.create({
      data: {
        customerName: 'Cliente Status Inválido',
        totalAmount: 50.0,
        status: 'PROCESSING',
      },
    });

    const response = await request(app)
      .patch(`/api/v1/orders/${createdOrder.id}/status`)
      .send({ status: 'STATUS_MALUCO' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Status inválido');
  });

  it('should return a 400 error if the ID passed in the parameters is invalid when updating status', async () => {
    const response = await request(app)
      .patch('/api/v1/orders/id-invalido-123/status')
      .send({ status: 'COMPLETED' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Parâmetro inválido');
  });

  it('should return a 400 error if the order is not found when attempting to update the status', async () => {
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app)
      .patch(`/api/v1/orders/${fakeUuid}/status`)
      .send({ status: 'DELIVERED' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Pedido não encontrado');
  });

  it('should return a 500 error if an internal error occurs while updating the status', async () => {
    const spy = vi.spyOn(prisma.order, 'findUnique').mockRejectedValueOnce(new Error('Erro de banco'));

    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app)
      .patch(`/api/v1/orders/${fakeUuid}/status`)
      .send({ status: 'DELIVERED' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro técnico');
    expect(response.body).toHaveProperty('message', 'Ocorreu um erro interno ao tentar atualizar o status do pedido.');

    spy.mockRestore();
  });

  it('should return a 400 error when attempting to fetch an order with an invalid ID/UUID', async () => {
    const response = await request(app).get('/api/v1/orders/123-uuid-invalido');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Parâmetro inválido');
  });

  it('should return a 500 error if an internal error occurs while listing orders', async () => {
    const spy = vi.spyOn(prisma.order, 'findMany').mockRejectedValueOnce(new Error('Erro de conexão com o banco'));

    const response = await request(app).get('/api/v1/orders');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro técnico');
    expect(response.body).toHaveProperty('message', 'Ocorreu um erro interno ao listar os pedidos.');

    spy.mockRestore();
  });

  it('should return a 500 error if an internal error occurs while fetching an order by ID', async () => {
    const spy = vi.spyOn(prisma.order, 'findUnique').mockRejectedValueOnce(new Error('Erro de conexão com o banco'));

    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app).get(`/api/v1/orders/${fakeUuid}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro técnico');
    expect(response.body).toHaveProperty('message', 'Ocorreu um erro interno ao processar a consulta do pedido.');

    spy.mockRestore();
  });

  it('should successfully cancel an order in progress', async () => {
    const createdOrder = await prisma.order.create({
      data: {
        customerName: 'Cliente para Cancelar',
        totalAmount: 200.0,
        status: 'PROCESSING',
      },
    });

    const response = await request(app).post(`/api/v1/orders/${createdOrder.id}/cancel`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('CANCELLED');
  });

  it('should return a 400 error when attempting to cancel an order that is not in progress', async () => {
    const createdOrder = await prisma.order.create({
      data: {
        customerName: 'Cliente Já Concluído',
        totalAmount: 120.0,
        status: 'DELIVERED',
      },
    });

    const response = await request(app).post(`/api/v1/orders/${createdOrder.id}/cancel`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Pedido não cancelável');
  });

  it('should return a 400 error if the ID passed is invalid when attempting to cancel', async () => {
    const response = await request(app).post('/api/v1/orders/id-invalido-123/cancel');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Parâmetro inválido');
  });

  it('should return a 400 error when attempting to cancel an order that is not in progress', async () => {
    const createdOrder = await prisma.order.create({
      data: {
        customerName: 'Cliente Não Cancelável',
        totalAmount: 100.0,
        status: 'DELIVERED',
      },
    });

    const response = await request(app).post(`/api/v1/orders/${createdOrder.id}/cancel`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Pedido não cancelável');
  });

  it('should return a 500 error if an internal error occurs while attempting to cancel the order', async () => {
    const spy = vi.spyOn(prisma.order, 'findUnique').mockRejectedValueOnce(new Error('Erro de banco'));

    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app).post(`/api/v1/orders/${fakeUuid}/cancel`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro técnico');
    expect(response.body).toHaveProperty('message', 'Ocorreu um erro interno ao tentar processar o cancelamento.');

    spy.mockRestore();
  });

  it('should return a 404 error if the order is not found when attempting to cancel', async () => {
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app).post(`/api/v1/orders/${fakeUuid}/cancel`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Pedido não encontrado');
    expect(response.body.message).toContain(`Não foi encontrado nenhum pedido com o ID ${fakeUuid} para cancelamento.`);
  });
});
/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { InMemoryOrderRepository } from '../repositories/inMemoryOrderRepository';
import { InMemoryProductRepository } from '../repositories/inMemoryProductRepository';
import { FakeStoreProductDto } from '../../src/validators/product.validator';

import { getOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder } from '../../src/http/controllers/orderController';
import { getExternalProducts, getExternalProductById } from '../../src/http/controllers/productController';

vi.mock('../../src/use-cases/factories/make-get-orders-use-case');
vi.mock('../../src/use-cases/factories/make-get-order-by-id-use-case');
vi.mock('../../src/use-cases/factories/make-create-order-use-case');
vi.mock('../../src/use-cases/factories/make-update-order-status-use-case');
vi.mock('../../src/use-cases/factories/make-cancel-order-use-case');
vi.mock('../../src/use-cases/factories/make-get-products-use-case');
vi.mock('../../src/use-cases/factories/make-get-product-by-id-use-case');

import { makeGetOrdersUseCase } from '../../src/use-cases/factories/make-get-orders-use-case';
import { makeGetOrderByIdUseCase } from '../../src/use-cases/factories/make-get-order-by-id-use-case';
import { makeCreateOrderUseCase } from '../../src/use-cases/factories/make-create-order-use-case';
import { makeUpdateOrderStatusUseCase } from '../../src/use-cases/factories/make-update-order-status-use-case';
import { makeCancelOrderUseCase } from '../../src/use-cases/factories/make-cancel-order-use-case';
import { makeGetProductsUseCase } from '../../src/use-cases/factories/make-get-products-use-case';
import { makeGetProductByIdUseCase } from '../../src/use-cases/factories/make-get-product-by-id-use-case';

import { GetOrdersUseCase } from '../../src/use-cases/get-orders';
import { GetOrderByIdUseCase } from '../../src/use-cases/get-order-by-id';
import { CreateOrderUseCase } from '../../src/use-cases/create-order';
import { UpdateOrderStatusUseCase } from '../../src/use-cases/update-order-status';
import { CancelOrderUseCase } from '../../src/use-cases/cancel-order';
import { GetProductsUseCase } from '../../src/use-cases/get-products';
import { GetProductByIdUseCase } from '../../src/use-cases/get-product-by-id';

function createMockResponse() {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

describe('Controller Unit Tests', () => {
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository([
      {
        id: 1,
        title: 'Test Product',
        price: 99.99,
        description: 'Test Description',
        category: 'electronics',
        image: 'https://example.com/image.jpg',
      },
    ]);

    // Mock all factory functions
    vi.mocked(makeGetOrdersUseCase).mockImplementation(() => new GetOrdersUseCase(orderRepository));
    vi.mocked(makeGetOrderByIdUseCase).mockImplementation(() => new GetOrderByIdUseCase(orderRepository));
    vi.mocked(makeCreateOrderUseCase).mockImplementation(() => new CreateOrderUseCase(orderRepository));
    vi.mocked(makeUpdateOrderStatusUseCase).mockImplementation(() => new UpdateOrderStatusUseCase(orderRepository));
    vi.mocked(makeCancelOrderUseCase).mockImplementation(() => new CancelOrderUseCase(orderRepository));
    vi.mocked(makeGetProductsUseCase).mockImplementation(() => new GetProductsUseCase(productRepository));
    vi.mocked(makeGetProductByIdUseCase).mockImplementation(() => new GetProductByIdUseCase(productRepository));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Order Controller', () => {
    describe('getOrders', () => {
      it('should return empty list when no orders exist', async () => {
        const req: any = {};
        const res = createMockResponse();

        await getOrders(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          total: 0,
          data: [],
        });
      });

      it('should return all orders sorted by createdAt descending', async () => {
        await orderRepository.create({
          customerName: 'Primeiro',
          items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
          totalAmount: 10,
        });

        await new Promise(resolve => setTimeout(resolve, 10));

        await orderRepository.create({
          customerName: 'Segundo',
          items: [{ productId: 2, title: 'Produto', price: 20, quantity: 1 }],
          totalAmount: 20,
        });

        const req: any = {};
        const res = createMockResponse();

        await getOrders(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            total: 2,
          })
        );
        const responseData = res.json.mock.calls[0][0];
        expect(responseData.data[0].customerName).toBe('Segundo');
        expect(responseData.data[1].customerName).toBe('Primeiro');
      });
    });

    describe('getOrderById', () => {
      it('should return order by ID', async () => {
        const created = await orderRepository.create({
          customerName: 'Cliente Específico',
          items: [{ productId: 99, title: 'Item Único', price: 150.0, quantity: 1 }],
          totalAmount: 150.0,
        });

        const req: any = { params: { id: created.id } };
        const res = createMockResponse();

        await getOrderById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              id: created.id,
              customerName: 'Cliente Específico',
            }),
          })
        );
      });

      it('should return 404 when order does not exist', async () => {
        const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
        const req: any = { params: { id: fakeUuid } };
        const res = createMockResponse();

        await getOrderById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Pedido não encontrado',
            message: expect.stringContaining(fakeUuid),
          })
        );
      });

      it('should return 400 when ID format is invalid', async () => {
        const req: any = { params: { id: '123-invalid' } };
        const res = createMockResponse();

        await getOrderById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Parâmetro inválido',
          })
        );
      });
    });

    describe('createOrder', () => {
      it('should create order and return 201', async () => {
        const payload = {
          customerName: 'João Silva',
          items: [
            { productId: 1, title: 'Produto A', price: 50.0, quantity: 2 },
            { productId: 2, title: 'Produto B', price: 25.5, quantity: 1 },
          ],
        };

        const req: any = { body: payload };
        const res = createMockResponse();

        await createOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              customerName: 'João Silva',
              totalAmount: 125.5,
              status: 'PROCESSING',
            }),
          })
        );
      });

      it('should return 400 when customerName is missing', async () => {
        const req: any = { body: { items: [{ productId: 1, title: 'Produto', price: 50.0, quantity: 1 }] } };
        const res = createMockResponse();

        await createOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Dados inválidos',
          })
        );
      });

      it('should return 400 when items array is empty', async () => {
        const req: any = { body: { customerName: 'Cliente Sem Itens', items: [] } };
        const res = createMockResponse();

        await createOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Dados inválidos',
          })
        );
      });
    });

    describe('updateOrderStatus', () => {
      it('should update order status successfully', async () => {
        const created = await orderRepository.create({
          customerName: 'Cliente para Atualizar',
          items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
          totalAmount: 10,
        });

        const req: any = { params: { id: created.id }, body: { status: 'DELIVERED' } };
        const res = createMockResponse();

        await updateOrderStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              id: created.id,
              status: 'DELIVERED',
            }),
          })
        );
      });

      it('should return 400 when status is invalid', async () => {
        const created = await orderRepository.create({
          customerName: 'Cliente Status Inválido',
          items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
          totalAmount: 10,
        });

        const req: any = { params: { id: created.id }, body: { status: 'STATUS_INVALIDO' } };
        const res = createMockResponse();

        await updateOrderStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Status inválido',
          })
        );
      });

      it('should return 400 when ID format is invalid', async () => {
        const req: any = { params: { id: 'id-invalido-123' }, body: { status: 'DELIVERED' } };
        const res = createMockResponse();

        await updateOrderStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Parâmetro inválido',
          })
        );
      });

      it('should return 404 when order does not exist', async () => {
        const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
        const req: any = { params: { id: fakeUuid }, body: { status: 'DELIVERED' } };
        const res = createMockResponse();

        await updateOrderStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Pedido não encontrado',
            message: expect.stringContaining(fakeUuid),
          })
        );
      });
    });

    describe('cancelOrder', () => {
      it('should cancel order in PROCESSING status', async () => {
        const created = await orderRepository.create({
          customerName: 'Cliente para Cancelar',
          items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
          totalAmount: 10,
        });

        const req: any = { params: { id: created.id } };
        const res = createMockResponse();

        await cancelOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              id: created.id,
              status: 'CANCELLED',
            }),
          })
        );
      });

      it('should return 400 when order is not in PROCESSING status', async () => {
        const created = await orderRepository.create({
          customerName: 'Cliente Já Concluído',
          items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
          totalAmount: 10,
        });

        await orderRepository.updateStatus(created.id, 'DELIVERED');

        const req: any = { params: { id: created.id } };
        const res = createMockResponse();

        await cancelOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Pedido não cancelável',
            currentStatus: 'DELIVERED',
          })
        );
      });

      it('should return 400 when ID format is invalid', async () => {
        const req: any = { params: { id: 'id-invalido-123' } };
        const res = createMockResponse();

        await cancelOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Parâmetro inválido',
          })
        );
      });

      it('should return 404 when order does not exist', async () => {
        const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
        const req: any = { params: { id: fakeUuid } };
        const res = createMockResponse();

        await cancelOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Pedido não encontrado',
            message: expect.stringContaining(fakeUuid),
          })
        );
      });
    });
  });

  describe('Product Controller', () => {
    describe('getExternalProducts', () => {
      it('should return list of products', async () => {
        const req: any = {};
        const res = createMockResponse();

        await getExternalProducts(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            source: 'Fake Store API (https://fakestoreapi.com)',
            total: 1,
            data: expect.arrayContaining([
              expect.objectContaining({
                id: 1,
                title: 'Test Product',
              }),
            ]),
          })
        );
      });
    });

    describe('getExternalProductById', () => {
      it('should return product by ID', async () => {
        const req: any = { params: { id: '1' } };
        const res = createMockResponse();

        await getExternalProductById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            source: 'Fake Store API (https://fakestoreapi.com)',
            data: expect.objectContaining({
              id: 1,
              title: 'Test Product',
            }),
          })
        );
      });

      it('should return 404 when product does not exist', async () => {
        const req: any = { params: { id: '999' } };
        const res = createMockResponse();

        await getExternalProductById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Produto não encontrado',
            message: expect.stringContaining('ID 999'),
          })
        );
      });

      it('should return 400 when ID is not a valid number', async () => {
        const req: any = { params: { id: 'abc' } };
        const res = createMockResponse();

        await getExternalProductById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Parâmetro inválido',
          })
        );
      });
    });
  });
});
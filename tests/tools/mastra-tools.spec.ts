/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryOrderRepository } from '../repositories/inMemoryOrderRepository';
import { InMemoryProductRepository } from '../repositories/inMemoryProductRepository';
import { OrderNotFoundError, InvalidOrderStatusError, ProductNotFoundError } from '../../src/use-cases/errors';
import { FakeStoreProductDto } from '../../src/validators/product.validator';

vi.mock('../../src/use-cases/factories/make-get-order-by-id-use-case');
vi.mock('../../src/use-cases/factories/make-cancel-order-use-case');
vi.mock('../../src/use-cases/factories/make-get-product-by-id-use-case');

import { makeGetOrderByIdUseCase } from '../../src/use-cases/factories/make-get-order-by-id-use-case';
import { makeCancelOrderUseCase } from '../../src/use-cases/factories/make-cancel-order-use-case';
import { makeGetProductByIdUseCase } from '../../src/use-cases/factories/make-get-product-by-id-use-case';
import { getOrderTool, cancelOrderTool, searchExternalProductsTool } from '../../src/agent/tools';

type GetOrderToolResult = { success: boolean; order?: any; message?: string };
type CancelOrderToolResult = { success: boolean; order?: any; message?: string };
type SearchProductToolResult = { success: boolean; product?: any; message?: string };

describe('Mastra Tools', () => {
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

    vi.clearAllMocks();
  });

  describe('getOrderTool', () => {
    it('should return order when it exists', async () => {
      const created = await orderRepository.create({
        customerName: 'Teste',
        items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
        totalAmount: 10,
      });

      const mockUseCase = { execute: vi.fn().mockResolvedValue(created) };
      vi.mocked(makeGetOrderByIdUseCase).mockReturnValue(mockUseCase as any);

      const result = await (getOrderTool.execute as (args: { orderId: string }) => Promise<GetOrderToolResult>)({ orderId: created.id });

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order?.id).toBe(created.id);
    });

    it('should return error when order does not exist', async () => {
      const mockUseCase = { execute: vi.fn().mockRejectedValue(new OrderNotFoundError('non-existent-id')) };
      vi.mocked(makeGetOrderByIdUseCase).mockReturnValue(mockUseCase as any);

      const result = await (getOrderTool.execute as (args: { orderId: string }) => Promise<GetOrderToolResult>)({ orderId: 'non-existent-id' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Pedido não encontrado.');
    });

    it('should return generic error when unexpected error occurs', async () => {
      const mockUseCase = { execute: vi.fn().mockRejectedValue(new Error('Unexpected error')) };
      vi.mocked(makeGetOrderByIdUseCase).mockReturnValue(mockUseCase as any);

      const result = await (getOrderTool.execute as (args: { orderId: string }) => Promise<GetOrderToolResult>)({ orderId: 'some-id' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro interno ao consultar pedido.');
    });
  });

  describe('cancelOrderTool', () => {
    it('should cancel order successfully when in PROCESSING status', async () => {
      const created = await orderRepository.create({
        customerName: 'Teste',
        items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
        totalAmount: 10,
      });

      const cancelledOrder = { ...created, status: 'CANCELLED' as const };
      const mockUseCase = { execute: vi.fn().mockResolvedValue(cancelledOrder) };
      vi.mocked(makeCancelOrderUseCase).mockReturnValue(mockUseCase as any);

      const result = await (cancelOrderTool.execute as (args: { orderId: string }) => Promise<CancelOrderToolResult>)({ orderId: created.id });

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order?.status).toBe('CANCELLED');
    });

    it('should return error when order does not exist', async () => {
      const mockUseCase = { execute: vi.fn().mockRejectedValue(new OrderNotFoundError('non-existent-id')) };
      vi.mocked(makeCancelOrderUseCase).mockReturnValue(mockUseCase as any);

      const result = await (cancelOrderTool.execute as (args: { orderId: string }) => Promise<CancelOrderToolResult>)({ orderId: 'non-existent-id' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Pedido não encontrado.');
    });

    it('should return error when order status is not PROCESSING', async () => {
      const mockUseCase = { execute: vi.fn().mockRejectedValue(new InvalidOrderStatusError('DELIVERED')) };
      vi.mocked(makeCancelOrderUseCase).mockReturnValue(mockUseCase as any);

      const result = await (cancelOrderTool.execute as (args: { orderId: string }) => Promise<CancelOrderToolResult>)({ orderId: 'some-id' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('DELIVERED');
      expect(result.message).toContain('PROCESSING');
    });

    it('should return generic error when unexpected error occurs', async () => {
      const mockUseCase = { execute: vi.fn().mockRejectedValue(new Error('Unexpected error')) };
      vi.mocked(makeCancelOrderUseCase).mockReturnValue(mockUseCase as any);

      const result = await (cancelOrderTool.execute as (args: { orderId: string }) => Promise<CancelOrderToolResult>)({ orderId: 'some-id' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro interno ao cancelar pedido.');
    });
  });

  describe('searchExternalProductsTool', () => {
    it('should return product when it exists', async () => {
      const product: FakeStoreProductDto = {
        id: 1,
        title: 'Test Product',
        price: 99.99,
        description: 'Test Description',
        category: 'electronics',
        image: 'https://example.com/image.jpg',
      };

      const mockUseCase = { execute: vi.fn().mockResolvedValue(product) };
      vi.mocked(makeGetProductByIdUseCase).mockReturnValue(mockUseCase as any);

      const result = await (searchExternalProductsTool.execute as (args: { productId: number }) => Promise<SearchProductToolResult>)({ productId: 1 });

      expect(result.success).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product?.id).toBe(1);
    });

    it('should return error when product does not exist', async () => {
      const mockUseCase = { execute: vi.fn().mockRejectedValue(new ProductNotFoundError(999)) };
      vi.mocked(makeGetProductByIdUseCase).mockReturnValue(mockUseCase as any);

      const result = await (searchExternalProductsTool.execute as (args: { productId: number }) => Promise<SearchProductToolResult>)({ productId: 999 });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Produto não encontrado na base externa.');
    });

    it('should return generic error when unexpected error occurs', async () => {
      const mockUseCase = { execute: vi.fn().mockRejectedValue(new Error('Unexpected error')) };
      vi.mocked(makeGetProductByIdUseCase).mockReturnValue(mockUseCase as any);

      const result = await (searchExternalProductsTool.execute as (args: { productId: number }) => Promise<SearchProductToolResult>)({ productId: 1 });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro interno ao buscar produto na base externa.');
    });
  });
});
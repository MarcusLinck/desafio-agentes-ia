/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryOrderRepository } from '../repositories/inMemoryOrderRepository';
import { CreateOrderUseCase } from '../../src/use-cases/create-order';
import { GetOrderByIdUseCase } from '../../src/use-cases/get-order-by-id';
import { GetOrdersUseCase } from '../../src/use-cases/get-orders';
import { UpdateOrderStatusUseCase } from '../../src/use-cases/update-order-status';
import { CancelOrderUseCase } from '../../src/use-cases/cancel-order';
import { OrderNotFoundError, InvalidOrderStatusError } from '../../src/use-cases/errors';

describe('Order Use Cases', () => {
  let orderRepository: InMemoryOrderRepository;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
  });

  describe('CreateOrderUseCase', () => {
    it('should create an order with correct total amount', async () => {
      const useCase = new CreateOrderUseCase(orderRepository);

      const input = {
        customerName: 'João Silva',
        items: [
          { productId: 1, title: 'Produto A', price: 50.0, quantity: 2 },
          { productId: 2, title: 'Produto B', price: 25.5, quantity: 1 },
        ],
      };

      const order = await useCase.execute({ ...input, totalAmount: 125.5 });

      expect(order.id).toBeDefined();
      expect(order.customerName).toBe('João Silva');
      expect(order.totalAmount).toBe(125.5);
      expect(order.status).toBe('PROCESSING');
    });

    it('should calculate total amount correctly', async () => {
      const useCase = new CreateOrderUseCase(orderRepository);

      const input = {
        customerName: 'Maria Santos',
        items: [
          { productId: 1, title: 'Produto A', price: 100, quantity: 3 },
        ],
      };

      const order = await useCase.execute({ ...input, totalAmount: 300 });

      expect(order.totalAmount).toBe(300);
    });
  });

  describe('GetOrderByIdUseCase', () => {
    it('should return order when it exists', async () => {
      const useCase = new GetOrderByIdUseCase(orderRepository);

      const created = await orderRepository.create({
        customerName: 'Teste',
        items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
        totalAmount: 10,
      });

      const order = await useCase.execute(created.id);

      expect(order.id).toBe(created.id);
      expect(order.customerName).toBe('Teste');
    });

    it('should throw OrderNotFoundError when order does not exist', async () => {
      const useCase = new GetOrderByIdUseCase(orderRepository);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(OrderNotFoundError);

      try {
        await useCase.execute('non-existent-id');
      } catch (error) {
        expect(error).toBeInstanceOf(OrderNotFoundError);
        expect((error as OrderNotFoundError).orderId).toBe('non-existent-id');
      }
    });
  });

  describe('GetOrdersUseCase', () => {
    it('should return empty list when no orders exist', async () => {
      const useCase = new GetOrdersUseCase(orderRepository);

      const orders = await useCase.execute();

      expect(orders).toEqual([]);
    });

    it('should return all orders sorted by createdAt descending', async () => {
      const useCase = new GetOrdersUseCase(orderRepository);

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

      const orders = await useCase.execute();

      expect(orders).toHaveLength(2);
      expect(orders[0].customerName).toBe('Segundo');
      expect(orders[1].customerName).toBe('Primeiro');
    });
  });

  describe('UpdateOrderStatusUseCase', () => {
    it('should update order status successfully', async () => {
      const useCase = new UpdateOrderStatusUseCase(orderRepository);

      const created = await orderRepository.create({
        customerName: 'Teste',
        items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
        totalAmount: 10,
      });

      const updated = await useCase.execute(created.id, 'DELIVERED');

      expect(updated.id).toBe(created.id);
      expect(updated.status).toBe('DELIVERED');
    });

    it('should throw OrderNotFoundError when order does not exist', async () => {
      const useCase = new UpdateOrderStatusUseCase(orderRepository);

      await expect(useCase.execute('non-existent-id', 'DELIVERED')).rejects.toThrow(OrderNotFoundError);

      try {
        await useCase.execute('non-existent-id', 'DELIVERED');
      } catch (error) {
        expect(error).toBeInstanceOf(OrderNotFoundError);
        expect((error as OrderNotFoundError).orderId).toBe('non-existent-id');
      }
    });
  });

  describe('CancelOrderUseCase', () => {
    it('should cancel order successfully when status is PROCESSING', async () => {
      const useCase = new CancelOrderUseCase(orderRepository);

      const created = await orderRepository.create({
        customerName: 'Teste',
        items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
        totalAmount: 10,
      });

      const cancelled = await useCase.execute(created.id);

      expect(cancelled.id).toBe(created.id);
      expect(cancelled.status).toBe('CANCELLED');
    });

    it('should throw OrderNotFoundError when order does not exist', async () => {
      const useCase = new CancelOrderUseCase(orderRepository);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(OrderNotFoundError);

      try {
        await useCase.execute('non-existent-id');
      } catch (error) {
        expect(error).toBeInstanceOf(OrderNotFoundError);
        expect((error as OrderNotFoundError).orderId).toBe('non-existent-id');
      }
    });

    it('should throw InvalidOrderStatusError when order status is not PROCESSING', async () => {
      const useCase = new CancelOrderUseCase(orderRepository);

      const created = await orderRepository.create({
        customerName: 'Teste',
        items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
        totalAmount: 10,
      });

      await orderRepository.updateStatus(created.id, 'DELIVERED');

      await expect(useCase.execute(created.id)).rejects.toThrow(InvalidOrderStatusError);

      try {
        await useCase.execute(created.id);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidOrderStatusError);
        expect((error as InvalidOrderStatusError).currentStatus).toBe('DELIVERED');
        expect((error as InvalidOrderStatusError).allowedStatuses).toEqual(['PROCESSING']);
      }
    });

    it('should throw InvalidOrderStatusError for various non-PROCESSING statuses', async () => {
      const useCase = new CancelOrderUseCase(orderRepository);

      for (const status of ['DELIVERED', 'CANCELLED', 'SHIPPED'] as const) {
        const created = await orderRepository.create({
          customerName: `Teste ${status}`,
          items: [{ productId: 1, title: 'Produto', price: 10, quantity: 1 }],
          totalAmount: 10,
        });

        await orderRepository.updateStatus(created.id, status);

        await expect(useCase.execute(created.id)).rejects.toThrow(InvalidOrderStatusError);

        try {
          await useCase.execute(created.id);
        } catch (error) {
          expect(error).toBeInstanceOf(InvalidOrderStatusError);
          expect((error as InvalidOrderStatusError).currentStatus).toBe(status);
        }
      }
    });
  });
});
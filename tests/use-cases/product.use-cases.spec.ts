/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '../repositories/inMemoryProductRepository';
import { GetProductsUseCase } from '../../src/use-cases/get-products';
import { GetProductByIdUseCase } from '../../src/use-cases/get-product-by-id';
import { ProductNotFoundError } from '../../src/use-cases/errors';
import { FakeStoreProductDto } from '../../src/validators/product.validator';

const mockProducts: FakeStoreProductDto[] = [
  {
    id: 1,
    title: 'Produto 1',
    price: 100.0,
    description: 'Descrição 1',
    category: 'electronics',
    image: 'https://example.com/1.jpg',
  },
  {
    id: 2,
    title: 'Produto 2',
    price: 200.0,
    description: 'Descrição 2',
    category: 'clothing',
    image: 'https://example.com/2.jpg',
  },
];

describe('Product Use Cases', () => {
  let productRepository: InMemoryProductRepository;

  beforeEach(() => {
    productRepository = new InMemoryProductRepository([...mockProducts]);
  });

  describe('GetProductsUseCase', () => {
    it('should return all products', async () => {
      const useCase = new GetProductsUseCase(productRepository);

      const products = await useCase.execute();

      expect(products).toHaveLength(2);
      expect(products[0].id).toBe(1);
      expect(products[1].id).toBe(2);
    });

    it('should return empty array when no products exist', async () => {
      const emptyRepository = new InMemoryProductRepository([]);
      const useCase = new GetProductsUseCase(emptyRepository);

      const products = await useCase.execute();

      expect(products).toEqual([]);
    });
  });

  describe('GetProductByIdUseCase', () => {
    it('should return product when it exists', async () => {
      const useCase = new GetProductByIdUseCase(productRepository);

      const product = await useCase.execute(1);

      expect(product.id).toBe(1);
      expect(product.title).toBe('Produto 1');
      expect(product.price).toBe(100.0);
    });

    it('should throw ProductNotFoundError when product does not exist', async () => {
      const useCase = new GetProductByIdUseCase(productRepository);

      await expect(useCase.execute(999)).rejects.toThrow(ProductNotFoundError);

      try {
        await useCase.execute(999);
      } catch (error) {
        expect(error).toBeInstanceOf(ProductNotFoundError);
        expect((error as ProductNotFoundError).productId).toBe(999);
      }
    });
  });
});
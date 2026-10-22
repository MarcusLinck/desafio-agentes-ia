import type { ProductRepository } from '../../src/interfaces/product-repository';
import { FakeStoreProductDto } from '../../src/validators/product.validator';

export class InMemoryProductRepository implements ProductRepository {
  private products: Map<number, FakeStoreProductDto> = new Map();

  constructor(initialProducts: FakeStoreProductDto[] = []) {
    initialProducts.forEach(p => this.products.set(p.id, p));
  }

  async getProducts(): Promise<FakeStoreProductDto[]> {
    return Array.from(this.products.values());
  }

  async getProductById(productId: number): Promise<FakeStoreProductDto | null> {
    return this.products.get(productId) ?? null;
  }

  seed(product: FakeStoreProductDto): void {
    this.products.set(product.id, product);
  }

  clear(): void {
    this.products.clear();
  }
}
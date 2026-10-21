import { FakeStoreProductDto } from '../validators/product.validator';

export interface ProductRepository {
  getProducts(): Promise<FakeStoreProductDto[]>;
  getProductById(productId: number): Promise<FakeStoreProductDto | null>;
}
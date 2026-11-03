import { FakeStoreGateway } from '../../gateways/fakeStoreGateway.js';
import type { ProductRepository } from '../../interfaces/product-repository.js';
import { GetProductsUseCase } from '../get-products.js';

export function makeGetProductsUseCase(
  productProvider?: ProductRepository
) {
  const provider = productProvider || new FakeStoreGateway();
  const getProductsUseCase = new GetProductsUseCase(provider);

  return getProductsUseCase;
}
import { FakeStoreGateway } from '../../gateways/fakeStoreGateway.js';
import type { ProductRepository } from '../../interfaces/product-repository.js';
import { GetProductByIdUseCase } from '../get-product-by-id.js';

export function makeGetProductByIdUseCase(
  productProvider?: ProductRepository
) {
  const provider = productProvider || new FakeStoreGateway();
  const getProductByIdUseCase = new GetProductByIdUseCase(provider);

  return getProductByIdUseCase;
}
import { FakeStoreGateway } from '../../gateways/fakeStoreGateway.js';
import { GetProductsUseCase } from '../get-products.js';

export function makeGetProductsUseCase() {
  const productProvider = new FakeStoreGateway();
  const getProductsUseCase =  new GetProductsUseCase(productProvider);

  return getProductsUseCase;
}
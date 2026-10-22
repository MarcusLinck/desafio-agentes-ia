import { FakeStoreGateway } from '../../gateways/fakeStoreGateway.js';
import { GetProductByIdUseCase } from '../get-product-by-id.js';

export function makeGetProductByIdUseCase() {
  const productProvider = new FakeStoreGateway();
  const getProductByIdUseCase =  new GetProductByIdUseCase(productProvider);
  
  return getProductByIdUseCase;
}
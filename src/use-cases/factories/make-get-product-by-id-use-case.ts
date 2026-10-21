import { FakeStoreGateway } from '../../gateways/fakeStoreGateway';
import { GetProductByIdUseCase } from '../get-product-by-id';

export function makeGetProductByIdUseCase() {
  const productProvider = new FakeStoreGateway();
  const getProductByIdUseCase =  new GetProductByIdUseCase(productProvider);
  
  return getProductByIdUseCase;
}
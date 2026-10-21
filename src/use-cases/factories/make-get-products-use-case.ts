import { FakeStoreGateway } from '../../gateways/fakeStoreGateway';
import { GetProductsUseCase } from '../get-products';

export function makeGetProductsUseCase() {
  const productProvider = new FakeStoreGateway();
  const getProductsUseCase =  new GetProductsUseCase(productProvider);

  return getProductsUseCase;
}
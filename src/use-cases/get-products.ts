import type { ProductRepository } from '../interfaces/product-repository';
import { logger } from '../lib/logger';

export class GetProductsUseCase {
  constructor(private productProvider: ProductRepository) {}

  async execute() {
    logger.info({ useCase: 'GetProductsUseCase' }, 'Executando caso de uso: Buscar produtos');
    return await this.productProvider.getProducts();
  }
}
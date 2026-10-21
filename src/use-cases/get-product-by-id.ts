import type { ProductRepository } from '../interfaces/product-repository';
import { logger } from '../lib/logger';

export class GetProductByIdUseCase {
  constructor(private productProvider: ProductRepository) {}

  async execute(productId: number) {
    logger.info({ useCase: 'GetProductByIdUseCase', productId }, 'Executando caso de uso: Buscar produto por ID');
    return await this.productProvider.getProductById(productId);
  }
}
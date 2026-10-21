import type { ProductRepository } from '../interfaces/product-repository';
import { logger } from '../lib/logger';
import { ProductNotFoundError } from './errors';

export class GetProductByIdUseCase {
  constructor(private productProvider: ProductRepository) {}

  async execute(productId: number) {
    logger.info({ useCase: 'GetProductByIdUseCase', productId }, 'Executando caso de uso: Buscar produto por ID');
    const product = await this.productProvider.getProductById(productId);
    
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    
    return product;
  }
}
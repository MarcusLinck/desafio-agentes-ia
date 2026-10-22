import type { ProductRepository } from '../interfaces/product-repository.js';
import { logger } from '../lib/logger.js';
import { ProductNotFoundError } from './errors/index.js';

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
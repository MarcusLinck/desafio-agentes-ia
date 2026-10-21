export class ProductNotFoundError extends Error {
  constructor(productId: number) {
    super(`Produto não encontrado.`);
    this.name = 'ProductNotFoundError';
    this.productId = productId;
  }

  readonly productId: number;
}
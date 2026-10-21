export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Pedido não encontrado.`);
    this.name = 'OrderNotFoundError';
    this.orderId = orderId;
  }

  readonly orderId: string;
}
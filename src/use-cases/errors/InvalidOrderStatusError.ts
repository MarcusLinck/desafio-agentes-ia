export class InvalidOrderStatusError extends Error {
  constructor(currentStatus: string, allowedStatuses: string[] = ['PROCESSING']) {
    super(`O status do pedido não permite esta operação. Status atual: ${currentStatus}. Status permitidos: ${allowedStatuses.join(', ')}`);
    this.name = 'InvalidOrderStatusError';
    this.currentStatus = currentStatus;
    this.allowedStatuses = allowedStatuses;
  }

  readonly currentStatus: string;
  readonly allowedStatuses: string[];
}
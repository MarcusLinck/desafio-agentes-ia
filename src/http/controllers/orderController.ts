import { type Request, type Response } from 'express';
import { orderIdParamSchema, createOrderSchema, updateOrderStatusSchema } from '../../validators/order.validator';
import { makeGetOrdersUseCase } from '../../use-cases/factories/make-get-orders-use-case';
import { makeGetOrderByIdUseCase } from '../../use-cases/factories/make-get-order-by-id-use-case';
import { makeCreateOrderUseCase } from '../../use-cases/factories/make-create-order-use-case';
import { makeUpdateOrderStatusUseCase } from '../../use-cases/factories/make-update-order-status-use-case';
import { makeCancelOrderUseCase } from '../../use-cases/factories/make-cancel-order-use-case';
import { OrderNotFoundError, InvalidOrderStatusError } from '../../use-cases/errors';

export async function getOrders(_req: Request, res: Response) {
  try {
    const getOrdersUseCase = makeGetOrdersUseCase();
    const orders = await getOrdersUseCase.execute();
    
    return res.status(200).json({
      success: true,
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return res.status(500).json({
      error: 'Erro técnico',
      message: 'Ocorreu um erro interno ao listar os pedidos.',
    });
  }
}

export async function getOrderById(req: Request, res: Response) {
  const validationResult = orderIdParamSchema.safeParse(req.params);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Parâmetro inválido',
      message: validationResult.error.issues[0]?.message,
    });
  }

  const { id } = validationResult.data;

  try {
    const getOrderByIdUseCase = makeGetOrderByIdUseCase();
    const order = await getOrderByIdUseCase.execute(id);

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
        message: `Não foi encontrado nenhum pedido com o ID ${id}.`,
      });
    }
    console.error('Erro ao consultar pedido:', error);
    return res.status(500).json({
      error: 'Erro técnico',
      message: 'Ocorreu um erro interno ao processar a consulta do pedido.',
    });
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const validationResult = createOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Falha na validação dos dados de entrada.',
        issues: validationResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const createOrderUseCase = makeCreateOrderUseCase();
    const order = await createOrderUseCase.execute({
      ...validationResult.data,
      totalAmount: validationResult.data.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    });

    return res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso.',
      data: order,
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return res.status(500).json({
      error: 'Erro técnico',
      message: 'Ocorreu um erro interno ao tentar criar o pedido.',
    });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  const paramValidation = orderIdParamSchema.safeParse(req.params);
  if (!paramValidation.success) {
    return res.status(400).json({
      error: 'Parâmetro inválido',
      message: paramValidation.error.issues[0]?.message,
    });
  }

  const bodyValidation = updateOrderStatusSchema.safeParse(req.body);
  if (!bodyValidation.success) {
    return res.status(400).json({
      error: 'Status inválido',
      message: bodyValidation.error.issues[0]?.message,
    });
  }

  const { id } = paramValidation.data;
  const { status } = bodyValidation.data;

  try {
    const updateOrderStatusUseCase = makeUpdateOrderStatusUseCase();
    const updatedOrder = await updateOrderStatusUseCase.execute(id, status);

    return res.status(200).json({
      success: true,
      message: `Status do pedido ${id} atualizado para '${status}' com sucesso.`,
      data: updatedOrder,
    });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
        message: `Não foi encontrado nenhum pedido com o ID ${id}.`,
      });
    }
    console.error('Erro ao atualizar status do pedido:', error);
    return res.status(500).json({
      error: 'Erro técnico',
      message: 'Ocorreu um erro interno ao tentar atualizar o status do pedido.',
    });
  }
}

export async function cancelOrder(req: Request, res: Response) {
  const validationResult = orderIdParamSchema.safeParse(req.params);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Parâmetro inválido',
      message: validationResult.error.issues[0]?.message,
    });
  }

  const { id } = validationResult.data;

  try {
    const cancelOrderUseCase = makeCancelOrderUseCase();
    const order = await cancelOrderUseCase.execute(id);

    return res.status(200).json({
      success: true,
      message: `Pedido ${id} cancelado com sucesso.`,
      data: order,
    });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
        message: `Não foi encontrado nenhum pedido com o ID ${id} para cancelamento.`,
      });
    }
    if (error instanceof InvalidOrderStatusError) {
      return res.status(400).json({
        error: 'Pedido não cancelável',
        currentStatus: error.currentStatus,
        message: `O pedido ${id} não pode mais ser cancelado pois encontra-se no status '${error.currentStatus}'. Apenas pedidos em processamento ('PROCESSING') permitem cancelamento automatizado.`,
      });
    }
    console.error('Erro ao cancelar pedido:', error);
    return res.status(500).json({
      error: 'Erro técnico',
      message: 'Ocorreu um erro interno ao tentar processar o cancelamento.',
    });
  }
}
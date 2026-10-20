import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { orderIdParamSchema, createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

export async function getOrders(_req: Request, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

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
  try {
    const validationResult = orderIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Parâmetro inválido',
        message: validationResult.error.issues[0]?.message || 'ID em formato inválido.',
      });
    }

    const { id } = validationResult.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
        message: `Não foi encontrado nenhum pedido com o ID ${id}.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
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

    const { customerName, items } = validationResult.data;

    const totalAmount = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        customerName,
        status: 'PROCESSING',
        totalAmount,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
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
  try {
    const paramValidation = orderIdParamSchema.safeParse(req.params);

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Parâmetro inválido',
        message: paramValidation.error.issues[0]?.message || 'ID em formato inválido.',
      });
    }

    const bodyValidation = updateOrderStatusSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Status inválido',
        message: bodyValidation.error.issues[0]?.message || 'Status inválido.',
      });
    }

    const { id } = paramValidation.data;
    const { status } = bodyValidation.data;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return res.status(400).json({
        error: 'Pedido não encontrado',
        message: `Não foi encontrado nenhum pedido com o ID ${id}.`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return res.status(200).json({
      success: true,
      message: `Status do pedido ${id} atualizado para '${status}' com sucesso.`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return res.status(500).json({
      error: 'Erro técnico',
      message: 'Ocorreu um erro interno ao tentar atualizar o status do pedido.',
    });
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    const validationResult = orderIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Parâmetro inválido',
        message: validationResult.error.issues[0]?.message || 'ID em formato inválido.',
      });
    }

    const { id } = validationResult.data;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
        message: `Não foi encontrado nenhum pedido com o ID ${id} para cancelamento.`,
      });
    }

    if (order.status !== 'PROCESSING') {
      return res.status(400).json({
        error: 'Pedido não cancelável',
        currentStatus: order.status,
        message: `O pedido ${id} não pode mais ser cancelado pois encontra-se no status '${order.status}'. Apenas pedidos em processamento ('PROCESSING') permitem cancelamento automatizado.`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });

    return res.status(200).json({
      success: true,
      message: `Pedido ${id} cancelado com sucesso.`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    return res.status(500).json({
      error: 'Erro técnico',
      message: 'Ocorreu um erro interno ao tentar processar o cancelamento.',
    });
  }
}
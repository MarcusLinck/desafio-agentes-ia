import { z } from 'zod';

export const orderIdParamSchema = z.object({
  id: z.uuid({ message: 'O ID fornecido não é um UUID válido.' }),
});

const orderItemSchema = z.object({
  productId: z.number({ message: 'O ID do produto é obrigatório e deve ser numérico.' }).int().positive('O ID do produto deve ser um número inteiro positivo.'),
  title: z.string({ message: 'O título do produto é obrigatório.' }).min(1, 'O título não pode estar vazio.'),
  price: z.number({ message: 'O preço é obrigatório.' }).positive('O preço deve ser maior que zero.'),
  quantity: z.number({ message: 'A quantidade é obrigatória.' }).int().positive('A quantidade deve ser um número inteiro positivo.'),
});

export const createOrderSchema = z.object({
  customerName: z.string({ message: 'O nome do cliente é obrigatório.' }).min(2, 'O nome do cliente deve ter pelo menos 2 caracteres.'),
  items: z.array(orderItemSchema).min(1, 'O pedido deve conter pelo menos um item.'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    message: "O status informado deve ser um dos seguintes valores: PROCESSING, SHIPPED, DELIVERED, CANCELLED.",
  }),
});
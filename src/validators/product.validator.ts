import { z } from 'zod';

export const fakeStoreProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  image: z.url(),
});

export const fakeStoreProductArraySchema = z.array(fakeStoreProductSchema);

export type FakeStoreProductDto = z.infer<typeof fakeStoreProductSchema>;

export const getProductParamSchema = z.object({
  id: z
    .string()
    .trim()
    .refine((val) => /^\d+$/.test(val), {
      message: 'O ID do produto deve ser um número inteiro positivo.',
    })
    .refine((val) => parseInt(val, 10) > 0, {
      message: 'O ID do produto deve ser um número inteiro positivo.',
    })
    .transform((val) => parseInt(val, 10)),
});

export const agentChatBodySchema = z.object({
  message: z.string({ message: 'A mensagem é obrigatória.' }).min(1, 'A mensagem não pode estar vazia').max(2000, 'A mensagem não pode ter mais de 2000 caracteres'),
  sessionId: z.string().uuid({ message: 'sessionId deve ser um UUID válido.' }).optional(),
});

export type AgentChatBody = z.infer<typeof agentChatBodySchema>;
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
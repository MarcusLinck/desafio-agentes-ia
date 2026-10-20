import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { getExternalProducts, getExternalProductById } from '../../src/controllers/productController';
import { FakeStoreService } from '../../src/services/fakeStoreService';

vi.mock('../../src/services/fakeStoreService');

describe('Product Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getExternalProducts', () => {
    it('should return 200 and the list of products on success', async () => {
      vi.spyOn(FakeStoreService, 'getProducts').mockResolvedValueOnce([
        {
          id: 1,
          title: 'Produto Teste',
          price: 10.0,
          description: 'Desc',
          category: 'cat',
          image: 'https://img.com',
        },
      ]);

      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await getExternalProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, total: 1 })
      );
    });

    it('should return 503 when getProducts throws an error (catch block)', async () => {
      vi.spyOn(FakeStoreService, 'getProducts').mockRejectedValueOnce(new Error('Erro externo'));

      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await getExternalProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Serviço indisponível' })
      );
    });

    it('should handle correctly case the error thrown is not an instance of Error', async () => {
      vi.spyOn(FakeStoreService, 'getProducts').mockRejectedValueOnce('Erro em string pura');

      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await getExternalProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Erro ao comunicar com a API externa.' })
      );
    });
  });

  describe('getExternalProductById', () => {
    it('should return 400 if the ID passed is not a valid number', async () => {
      const req = { params: { id: 'abc' } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await getExternalProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Parâmetro inválido' })
      );
    });

    it('should return 404 if the product is not found in the external API', async () => {
      vi.spyOn(FakeStoreService, 'getProductById').mockResolvedValueOnce(null);

      const req = { params: { id: '999' } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await getExternalProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Produto não encontrado' })
      );
    });

    it('should return 200 and the product data when found', async () => {
      const mockProduct = {
        id: 1,
        title: 'Produto 1',
        price: 50.0,
        description: 'Desc',
        category: 'cat',
        image: 'https://img.com',
      };

      vi.spyOn(FakeStoreService, 'getProductById').mockResolvedValueOnce(mockProduct);

      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await getExternalProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockProduct })
      );
    });

    it('should return 503 when getProductById throws an error (catch block)', async () => {
      vi.spyOn(FakeStoreService, 'getProductById').mockRejectedValueOnce(new Error('Erro de conexão'));

      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await getExternalProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Serviço indisponível' })
      );
    });

    it('should handle correctly case the error thrown is not an instance of Error', async () => {
      vi.spyOn(FakeStoreService, 'getProductById').mockRejectedValueOnce(12345);

      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      await getExternalProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Erro ao comunicar com a API externa.' })
      );
    });
  });
});
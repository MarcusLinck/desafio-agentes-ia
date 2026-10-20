import { Request, Response } from 'express';
import { FakeStoreService } from '../services/fakeStoreService';

export async function getExternalProducts(_req: Request, res: Response) {
  try {
    const products = await FakeStoreService.getProducts();
    return res.status(200).json({
      success: true,
      source: 'Fake Store API (https://fakestoreapi.com)',
      total: products.length,
      data: products,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao comunicar com a API externa.';
    return res.status(503).json({
      error: 'Serviço indisponível',
      message,
    });
  }
}

export async function getExternalProductById(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Parâmetro inválido',
        message: 'O ID do produto deve ser um número válido.',
      });
    }

    const product = await FakeStoreService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Produto não encontrado',
        message: `Nenhum produto externo foi encontrado com o ID ${productId}.`,
      });
    }

    return res.status(200).json({
      success: true,
      source: 'Fake Store API (https://fakestoreapi.com)',
      data: product,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao comunicar com a API externa.';
    return res.status(503).json({
      error: 'Serviço indisponível',
      message,
    });
  }
}
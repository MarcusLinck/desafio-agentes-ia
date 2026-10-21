import { env } from '../env/index';
import axios from 'axios';
import { logger } from '../lib/logger';
import { fakeStoreProductSchema, fakeStoreProductArraySchema, FakeStoreProductDto } from '../validators/product.validator';
import type { ProductRepository } from '../interfaces/product-repository';

const FAKE_STORE_BASE_URL = env.FAKE_STORE_BASE_URL || 'https://fakestoreapi.com';

export class FakeStoreGateway implements ProductRepository {
  async getProducts(): Promise<FakeStoreProductDto[]> {
    try {
      logger.info({ gateway: 'FakeStoreGateway', action: 'getProducts' }, 'Buscando produtos na Fake Store API');
      
      const response = await axios.get(`${FAKE_STORE_BASE_URL}/products`, {
        timeout: 5000,
      });

      const validationResult = fakeStoreProductArraySchema.safeParse(response.data);

      if (!validationResult.success) {
        logger.error(
          { gateway: 'FakeStoreGateway', action: 'getProducts', issues: validationResult.error.issues },
          'Os dados retornados pela Fake Store API não correspondem ao schema esperado'
        );
        throw new Error('Contrato de dados da API externa inválido.');
      }

      return validationResult.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      logger.error(
        { gateway: 'FakeStoreGateway', action: 'getProducts', error: errorMessage },
        'Falha ao consumir ou validar a Fake Store API'
      );
      throw new Error(errorMessage || 'A API externa de produtos está temporariamente indisponível.');
    }
  }

  async getProductById(productId: number): Promise<FakeStoreProductDto | null> {
    try {
      logger.info(
        { gateway: 'FakeStoreGateway', action: 'getProductById', productId },
        'Buscando produto por ID na Fake Store API'
      );

      const response = await axios.get(`${FAKE_STORE_BASE_URL}/products/${productId}`, {
        timeout: 5000,
      });

      const validationResult = fakeStoreProductSchema.safeParse(response.data);

      if (!validationResult.success) {
        logger.error(
          { gateway: 'FakeStoreGateway', action: 'getProductById', productId, issues: validationResult.error.issues },
          'O produto retornado pela Fake Store API possui formato inválido'
        );
        throw new Error('Contrato de dados do produto externo inválido.');
      }

      return validationResult.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.warn(
          { gateway: 'FakeStoreGateway', action: 'getProductById', productId },
          'Produto não encontrado na Fake Store API'
        );
        return null;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      logger.error(
        { gateway: 'FakeStoreGateway', action: 'getProductById', productId, error: errorMessage },
        'Erro ao consultar produto na Fake Store API'
      );
      throw new Error(errorMessage || 'Não foi possível validar o produto na base externa no momento.');
    }
  }
}
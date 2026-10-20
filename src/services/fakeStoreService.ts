import axios from 'axios';
import { logger } from '../lib/logger';
import { fakeStoreProductSchema, fakeStoreProductArraySchema, FakeStoreProductDto } from '../validators/product.validator';

const FAKE_STORE_BASE_URL = process.env.FAKE_STORE_BASE_URL || 'https://fakestoreapi.com';

export class FakeStoreService {
  static async getProducts(): Promise<FakeStoreProductDto[]> {
    try {
      logger.info({ service: 'FakeStoreService', action: 'getProducts' }, 'Buscando produtos na Fake Store API');
      
      const response = await axios.get(`${FAKE_STORE_BASE_URL}/products`, {
        timeout: 5000,
      });

      const validationResult = fakeStoreProductArraySchema.safeParse(response.data);

      if (!validationResult.success) {
        logger.error(
          { service: 'FakeStoreService', action: 'getProducts', issues: validationResult.error.issues },
          'Os dados retornados pela Fake Store API não correspondem ao schema esperado'
        );
        throw new Error('Contrato de dados da API externa inválido.');
      }

      return validationResult.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      logger.error(
        { service: 'FakeStoreService', action: 'getProducts', error: errorMessage },
        'Falha ao consumir ou validar a Fake Store API'
      );
      throw new Error(errorMessage || 'A API externa de produtos está temporariamente indisponível.');
    }
  }

  static async getProductById(productId: number): Promise<FakeStoreProductDto | null> {
    try {
      logger.info(
        { service: 'FakeStoreService', action: 'getProductById', productId },
        'Buscando produto por ID na Fake Store API'
      );

      const response = await axios.get(`${FAKE_STORE_BASE_URL}/products/${productId}`, {
        timeout: 5000,
      });

      const validationResult = fakeStoreProductSchema.safeParse(response.data);

      if (!validationResult.success) {
        logger.error(
          { service: 'FakeStoreService', action: 'getProductById', productId, issues: validationResult.error.issues },
          'O produto retornado pela Fake Store API possui formato inválido'
        );
        throw new Error('Contrato de dados do produto externo inválido.');
      }

      return validationResult.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.warn(
          { service: 'FakeStoreService', action: 'getProductById', productId },
          'Produto não encontrado na Fake Store API'
        );
        return null;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      logger.error(
        { service: 'FakeStoreService', action: 'getProductById', productId, error: errorMessage },
        'Erro ao consultar produto na Fake Store API'
      );
      throw new Error(errorMessage || 'Não foi possível validar o produto na base externa no momento.');
    }
  }
}
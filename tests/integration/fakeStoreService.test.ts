import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { FakeStoreService } from '../../src/services/fakeStoreService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('FakeStoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a list of valid products when the external API responds successfully', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Mochila de Teste',
        price: 109.95,
        description: 'Descrição de teste para o produto.',
        category: 'roupa',
        image: 'https://fakestoreapi.com/img/test.jpg',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

    const products = await FakeStoreService.getProducts();

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe(1);
    expect(products[0].title).toBe('Mochila de Teste');
  });

  it('should throw an error if the data contract violates the Zod schema', async () => {
    const invalidProducts = [
      {
        id: 'nao-numerico',
        title: 'Produto Inválido',
        price: 'cem',
        description: 'Teste',
        category: 'teste',
        image: 'url-invalida',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: invalidProducts });

    await expect(FakeStoreService.getProducts()).rejects.toThrow('Contrato de dados da API externa inválido.');
  });

  it('should return null if the product is not found (404)', async () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 404,
      },
    };

    mockedAxios.get.mockRejectedValueOnce(axiosError);
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    const product = await FakeStoreService.getProductById(999);

    expect(product).toBeNull();
  });

  it('should handle correctly when an error that is not an instance of Error is thrown in getProducts', async () => {
    mockedAxios.get.mockRejectedValueOnce('Erro string pura');

    await expect(FakeStoreService.getProducts()).rejects.toThrow('Erro desconhecido');
  });

  it('should handle correctly when an error without a message is thrown', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error(''));

    await expect(FakeStoreService.getProducts()).rejects.toThrow('A API externa de produtos está temporariamente indisponível.');
  });

  it('should handle Axios error without response object (e.g., network failure/timeout)', async () => {
    const networkError = {
      isAxiosError: true,
      response: undefined,
    };

    mockedAxios.get.mockRejectedValueOnce(networkError);
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    await expect(FakeStoreService.getProductById(1)).rejects.toThrow();
  });

  it('should handle correctly when an error that is not an instance of Error is thrown in getProductById', async () => {
    mockedAxios.get.mockRejectedValueOnce({ someRandomObject: true });

    await expect(FakeStoreService.getProductById(1)).rejects.toThrow();
  });

  it('should throw an error if the data contract of the product by ID violates the Zod schema', async () => {
    const invalidProduct = {
      id: 'nao-numerico',
      title: 'Produto Inválido',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: invalidProduct });

    await expect(FakeStoreService.getProductById(1)).rejects.toThrow('Contrato de dados do produto externo inválido.');
  });

  it('should return a valid product when the external API responds successfully by ID', async () => {
    const mockProduct = {
      id: 1,
      title: 'Fjallraven - Foldsack No. 1 Backpack',
      price: 109.95,
      description: 'Your perfect pack for everyday use...',
      category: "men's clothing",
      image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockProduct });

    const product = await FakeStoreService.getProductById(1);

    expect(product).toEqual(mockProduct);
  });

  it('should use the default message when the error does not have a message in getProductById', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error(''));

    await expect(FakeStoreService.getProductById(1)).rejects.toThrow(
      'Não foi possível validar o produto na base externa no momento.'
    );
  });
});
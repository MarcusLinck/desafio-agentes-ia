export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Pedidos e Agente de Atendimento',
    version: '1.0.0',
    description: 'Documentação completa da API principal desenvolvida para o desafio de Agente de Atendimento em IA.',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Servidor Local de Desenvolvimento',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Verificação de integridade e saúde da API',
    },
    {
      name: 'Orders',
      description: 'Operações de CRUD, gerenciamento de status e cancelamento de pedidos',
    },
    {
      name: 'Products',
      description: 'Consulta de produtos externos complementares (Fake Store API)',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Verifica o status de execução da API',
        tags: ['Health'],
        responses: {
          200: {
            description: 'API online e operacional',
            content: {
              'application/json': {
                example: {
                  status: 'ok',
                  message: 'AI agent running!',
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/orders': {
      get: {
        summary: 'Lista todos os pedidos',
        description: 'Retorna a lista completa de pedidos cadastrados com os seus respectivos itens, ordenados por data de criação.',
        tags: ['Orders'],
        responses: {
          200: {
            description: 'Lista de pedidos recuperada com sucesso',
            content: {
              'application/json': {
                example: {
                  success: true,
                  total: 1,
                  data: [
                    {
                      id: '77f37789-4440-4f12-9154-d64c940c8b79',
                      customerName: 'John Doe',
                      status: 'PROCESSING',
                      totalAmount: 46.00,
                      createdAt: '2026-10-20T17:18:18.755Z',
                      updatedAt: '2026-10-20T17:18:18.755Z',
                      items: [
                        {
                          id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
                          orderId: '77f37789-4440-4f12-9154-d64c940c8b79',
                          productId: 1,
                          title: 'Fíjian Water',
                          price: 10.50,
                          quantity: 2,
                        },
                        {
                          id: '9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c',
                          orderId: '77f37789-4440-4f12-9154-d64c940c8b79',
                          productId: 2,
                          title: 'Café Gourmet em Grãos',
                          price: 25.00,
                          quantity: 1,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
          500: {
            description: 'Erro interno no servidor',
            content: {
              'application/json': {
                example: {
                  error: 'Erro técnico',
                  message: 'Ocorreu um erro interno ao listar os pedidos.',
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Cria um novo pedido',
        description: 'Recebe os dados do cliente e a lista de itens para registrar um pedido com status inicial "PROCESSING".',
        tags: ['Orders'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customerName', 'items'],
                properties: {
                  customerName: { type: 'string', example: 'Mateus Ferraz' },
                  items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['productId', 'title', 'price', 'quantity'],
                      properties: {
                        productId: { type: 'number', example: 1 },
                        title: { type: 'string', example: 'Fíjian Water' },
                        price: { type: 'number', example: 10.50 },
                        quantity: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Pedido criado com sucesso',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Pedido criado com sucesso.',
                  data: {
                    id: '77f37789-4440-4f12-9154-d64c940c8b79',
                    customerName: 'Mateus Ferraz',
                    status: 'PROCESSING',
                    totalAmount: 46.00,
                    createdAt: '2026-10-20T17:18:18.755Z',
                    items: [
                      {
                        id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
                        productId: 1,
                        title: 'Fíjian Water',
                        price: 10.50,
                        quantity: 2,
                      },
                    ],
                  },
                },
              },
            },
          },
          400: {
            description: 'Dados de entrada inválidos',
            content: {
              'application/json': {
                example: {
                  error: 'Dados inválidos',
                  message: 'Falha na validação dos dados de entrada.',
                  issues: [
                    {
                      field: 'customerName',
                      message: 'Nome do cliente é obrigatório',
                    },
                  ],
                },
              },
            },
          },
          500: {
            description: 'Erro interno ao criar o pedido',
          },
        },
      },
    },
    '/api/v1/orders/{id}': {
      get: {
        summary: 'Consulta um pedido por ID',
        tags: ['Orders'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID no formato UUID do pedido',
            example: '77f37789-4440-4f12-9154-d64c940c8b79',
          },
        ],
        responses: {
          200: {
            description: 'Pedido encontrado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    id: '77f37789-4440-4f12-9154-d64c940c8b79',
                    customerName: 'Mateus Ferraz',
                    status: 'PROCESSING',
                    totalAmount: 46.00,
                    items: [],
                  },
                },
              },
            },
          },
          400: {
            description: 'Parâmetro ID inválido',
            content: {
              'application/json': {
                example: {
                  error: 'Parâmetro inválido',
                  message: 'ID do pedido deve ser um UUID válido.',
                },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                example: {
                  error: 'Pedido não encontrado',
                  message: 'Não foi encontrado nenhum pedido com o ID 77f37789-4440-4f12-9154-d64c940c8b79.',
                },
              },
            },
          },
          500: {
            description: 'Erro interno na consulta',
          },
        },
      },
    },
    '/api/v1/orders/{id}/status': {
      patch: {
        summary: 'Atualiza o status de um pedido',
        tags: ['Orders'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID UUID do pedido',
            example: '77f37789-4440-4f12-9154-d64c940c8b79',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
                    example: 'SHIPPED',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Status do pedido atualizado com sucesso',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: "Status do pedido 77f37789-4440-4f12-9154-d64c940c8b79 atualizado para 'SHIPPED' com sucesso.",
                  data: {
                    id: '77f37789-4440-4f12-9154-d64c940c8b79',
                    status: 'SHIPPED',
                  },
                },
              },
            },
          },
          400: {
            description: 'Parâmetro, status ou pedido não encontrado',
            content: {
              'application/json': {
                example: {
                  error: 'Status inválido',
                  message: 'Status do pedido informado é inválido.',
                },
              },
            },
          },
          500: {
            description: 'Erro interno ao atualizar o status',
          },
        },
      },
    },
    '/api/v1/orders/{id}/cancel': {
      post: {
        summary: 'Solicita o cancelamento automatizado de um pedido',
        description: 'Permite o cancelamento do pedido caso seu status atual seja apenas "PROCESSING".',
        tags: ['Orders'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID UUID do pedido',
            example: '77f37789-4440-4f12-9154-d64c940c8b79',
          },
        ],
        responses: {
          200: {
            description: 'Pedido cancelado com sucesso',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Pedido 77f37789-4440-4f12-9154-d64c940c8b79 cancelado com sucesso.',
                  data: {
                    id: '77f37789-4440-4f12-9154-d64c940c8b79',
                    status: 'CANCELLED',
                  },
                },
              },
            },
          },
          400: {
            description: 'Regra de negócio violada (pedido não pode ser cancelado)',
            content: {
              'application/json': {
                example: {
                  error: 'Pedido não cancelável',
                  currentStatus: 'SHIPPED',
                  message: "O pedido 77f37789-4440-4f12-9154-d64c940c8b79 não pode mais ser cancelado pois encontra-se no status 'SHIPPED'. Apenas pedidos em processamento ('PROCESSING') permitem cancelamento automatizado.",
                },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado para cancelamento',
            content: {
              'application/json': {
                example: {
                  error: 'Pedido não encontrado',
                  message: 'Não foi encontrado nenhum pedido com o ID 77f37789-4440-4f12-9154-d64c940c8b79 para cancelamento.',
                },
              },
            },
          },
          500: {
            description: 'Erro interno ao processar cancelamento',
          },
        },
      },
    },
    '/api/v1/external-products': {
      get: {
        summary: 'Lista todos os produtos externos',
        description: 'Consome a Fake Store API e retorna o catálogo completo de produtos validados via Zod.',
        tags: ['Products'],
        responses: {
          200: {
            description: 'Lista de produtos externos recuperada com sucesso',
            content: {
              'application/json': {
                example: {
                  success: true,
                  source: 'Fake Store API (https://fakestoreapi.com)',
                  total: 20,
                  data: [
                    {
                      id: 1,
                      title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
                      price: 109.95,
                      description: 'Your perfect pack for everyday use and walks in the forest...',
                      category: "men's clothing",
                      image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
                    },
                  ],
                },
              },
            },
          },
          503: {
            description: 'Serviço de integração com a Fake Store API indisponível',
            content: {
              'application/json': {
                example: {
                  error: 'Serviço indisponível',
                  message: 'A API externa de produtos está temporariamente indisponível.',
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/external-products/{id}': {
      get: {
        summary: 'Busca um produto externo pelo ID',
        description: 'Retorna os detalhes de um único produto da Fake Store API utilizando o ID numérico.',
        tags: ['Products'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'ID numérico do produto externo',
            example: 1,
          },
        ],
        responses: {
          200: {
            description: 'Detalhes do produto recuperados com sucesso',
            content: {
              'application/json': {
                example: {
                  success: true,
                  source: 'Fake Store API (https://fakestoreapi.com)',
                  data: {
                    id: 1,
                    title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
                    price: 109.95,
                    description: 'Your perfect pack for everyday use and walks in the forest...',
                    category: "men's clothing",
                    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
                  },
                },
              },
            },
          },
          400: {
            description: 'Parâmetro de ID inválido',
            content: {
              'application/json': {
                example: {
                  error: 'Parâmetro inválido',
                  message: 'O ID do produto deve ser um número válido.',
                },
              },
            },
          },
          404: {
            description: 'Produto não encontrado na API externa',
            content: {
              'application/json': {
                example: {
                  error: 'Produto não encontrado',
                  message: 'Nenhum produto externo foi encontrado com o ID 999.',
                },
              },
            },
          },
          503: {
            description: 'Serviço indisponível ou erro no contrato de dados',
            content: {
              'application/json': {
                example: {
                  error: 'Serviço indisponível',
                  message: 'Não foi possível validar o produto na base externa no momento.',
                },
              },
            },
          },
        },
      },
    },
  },
};
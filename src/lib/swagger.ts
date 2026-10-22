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
    {
      name: 'Agent',
      description: 'Interação com o agente de atendimento inteligente (IA)',
    },
  ],
  components: {
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          message: { type: 'string', example: 'AI agent running!' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d' },
          orderId: { type: 'string', format: 'uuid', example: '77f37789-4440-4f12-9154-d64c940c8b79' },
          productId: { type: 'number', example: 1 },
          title: { type: 'string', example: 'Fíjian Water' },
          price: { type: 'number', example: 10.50 },
          quantity: { type: 'integer', example: 2 },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '77f37789-4440-4f12-9154-d64c940c8b79' },
          customerName: { type: 'string', example: 'Mateus Ferraz' },
          status: { type: 'string', enum: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], example: 'PROCESSING' },
          totalAmount: { type: 'number', example: 46.00 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-20T17:18:18.755Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-20T17:18:18.755Z' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
        },
      },
      OrderListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          total: { type: 'integer', example: 1 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Order' },
          },
        },
      },
      OrderResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Order' },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['customerName', 'items'],
        properties: {
          customerName: { type: 'string', example: 'Mateus Ferraz', minLength: 2 },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['productId', 'title', 'price', 'quantity'],
              properties: {
                productId: { type: 'number', example: 1, minimum: 1 },
                title: { type: 'string', example: 'Fíjian Water', minLength: 1 },
                price: { type: 'number', example: 10.50, exclusiveMinimum: 0 },
                quantity: { type: 'integer', example: 2, minimum: 1 },
              },
            },
          },
        },
      },
      CreateOrderResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Pedido criado com sucesso.' },
          data: { $ref: '#/components/schemas/Order' },
        },
      },
      UpdateOrderStatusRequest: {
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
      UpdateOrderStatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: "Status do pedido 77f37789-4440-4f12-9154-d64c940c8b79 atualizado para 'SHIPPED' com sucesso." },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '77f37789-4440-4f12-9154-d64c940c8b79' },
              status: { type: 'string', enum: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], example: 'SHIPPED' },
            },
          },
        },
      },
      CancelOrderResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Pedido 77f37789-4440-4f12-9154-d64c940c8b79 cancelado com sucesso.' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '77f37789-4440-4f12-9154-d64c940c8b79' },
              status: { type: 'string', enum: ['CANCELLED'], example: 'CANCELLED' },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Erro técnico' },
          message: { type: 'string', example: 'Ocorreu um erro interno ao processar a requisição.' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Dados inválidos' },
          message: { type: 'string', example: 'Falha na validação dos dados de entrada.' },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'customerName' },
                message: { type: 'string', example: 'Nome do cliente é obrigatório' },
              },
            },
          },
        },
      },
      OrderNotCancelableResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Pedido não cancelável' },
          currentStatus: { type: 'string', example: 'SHIPPED' },
          message: { type: 'string', example: "O pedido não pode mais ser cancelado pois encontra-se no status 'SHIPPED'. Apenas pedidos em processamento ('PROCESSING') permitem cancelamento automatizado." },
        },
      },
      ExternalProduct: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops' },
          price: { type: 'number', example: 109.95 },
          description: { type: 'string', example: 'Your perfect pack for everyday use and walks in the forest...' },
          category: { type: 'string', example: "men's clothing" },
          image: { type: 'string', format: 'uri', example: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg' },
        },
      },
      ExternalProductListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          source: { type: 'string', example: 'Fake Store API (https://fakestoreapi.com)' },
          total: { type: 'integer', example: 20 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/ExternalProduct' },
          },
        },
      },
      ExternalProductResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          source: { type: 'string', example: 'Fake Store API (https://fakestoreapi.com)' },
          data: { $ref: '#/components/schemas/ExternalProduct' },
        },
      },
      AgentChatRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          threadId: { type: 'string', example: 'thread-123', description: 'ID opcional da thread de conversa para manter contexto' },
          message: { type: 'string', example: 'Olá, gostaria de saber o status do meu pedido', description: 'Mensagem do usuário para o agente' },
        },
      },
      AgentChatResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          response: { type: 'string', example: 'Olá! Para verificar o status do seu pedido, preciso do número do pedido. Poderia me informar?' },
        },
      },
      AgentErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Erro interno ao processar a mensagem com o agente de IA.' },
        },
      },
      ServiceUnavailableResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Serviço indisponível' },
          message: { type: 'string', example: 'A API externa de produtos está temporariamente indisponível.' },
        },
      },
    },
    parameters: {
      OrderIdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'ID no formato UUID do pedido',
        example: '77f37789-4440-4f12-9154-d64c940c8b79',
      },
      ProductIdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'ID numérico do produto externo',
        example: 1,
      },
    },
  },
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
                schema: { $ref: '#/components/schemas/HealthResponse' },
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
                schema: { $ref: '#/components/schemas/OrderListResponse' },
              },
            },
          },
          500: {
            description: 'Erro interno no servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
              schema: { $ref: '#/components/schemas/CreateOrderRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Pedido criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateOrderResponse' },
              },
            },
          },
          400: {
            description: 'Dados de entrada inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
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
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/orders/{id}': {
      get: {
        summary: 'Consulta um pedido por ID',
        tags: ['Orders'],
        parameters: [{ $ref: '#/components/parameters/OrderIdParam' }],
        responses: {
          200: {
            description: 'Pedido encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OrderResponse' },
              },
            },
          },
          400: {
            description: 'Parâmetro ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  error: 'Pedido não encontrado',
                  message: 'Não foi encontrado nenhum pedido com o ID 77f37789-4440-4f12-9154-d64c940c8b79.',
                },
              },
            },
          },
          500: {
            description: 'Erro interno na consulta',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/orders/{id}/status': {
      patch: {
        summary: 'Atualiza o status de um pedido',
        tags: ['Orders'],
        parameters: [{ $ref: '#/components/parameters/OrderIdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOrderStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Status do pedido atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateOrderStatusResponse' },
              },
            },
          },
          400: {
            description: 'Parâmetro, status ou pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  error: 'Status inválido',
                  message: 'Status do pedido informado é inválido.',
                },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  error: 'Pedido não encontrado',
                  message: 'Não foi encontrado nenhum pedido com o ID informado.',
                },
              },
            },
          },
          500: {
            description: 'Erro interno ao atualizar o status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/orders/{id}/cancel': {
      post: {
        summary: 'Solicita o cancelamento automatizado de um pedido',
        description: 'Permite o cancelamento do pedido caso seu status atual seja apenas "PROCESSING".',
        tags: ['Orders'],
        parameters: [{ $ref: '#/components/parameters/OrderIdParam' }],
        responses: {
          200: {
            description: 'Pedido cancelado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CancelOrderResponse' },
              },
            },
          },
          400: {
            description: 'Regra de negócio violada (pedido não pode ser cancelado)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OrderNotCancelableResponse' },
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
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  error: 'Pedido não encontrado',
                  message: 'Não foi encontrado nenhum pedido com o ID 77f37789-4440-4f12-9154-d64c940c8b79 para cancelamento.',
                },
              },
            },
          },
          500: {
            description: 'Erro interno ao processar cancelamento',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
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
                schema: { $ref: '#/components/schemas/ExternalProductListResponse' },
              },
            },
          },
          503: {
            description: 'Serviço de integração com a Fake Store API indisponível',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ServiceUnavailableResponse' },
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
        parameters: [{ $ref: '#/components/parameters/ProductIdParam' }],
        responses: {
          200: {
            description: 'Detalhes do produto recuperados com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ExternalProductResponse' },
              },
            },
          },
          400: {
            description: 'Parâmetro de ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
                schema: { $ref: '#/components/schemas/ServiceUnavailableResponse' },
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
    '/api/v1/chat': {
      post: {
        summary: 'Envia uma mensagem para o agente de atendimento (IA)',
        description: 'Processa uma mensagem do usuário através do agente inteligente de atendimento. O agente pode responder perguntas, consultar pedidos, verificar status, e realizar outras ações relacionadas ao atendimento ao cliente.',
        tags: ['Agent'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AgentChatRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Resposta do agente gerada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AgentChatResponse' },
              },
            },
          },
          400: {
            description: 'Mensagem inválida ou ausente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                example: {
                  error: 'Dados inválidos',
                  message: 'O campo "message" é obrigatório e deve ser uma string.',
                  issues: [
                    {
                      field: 'message',
                      message: 'O campo "message" é obrigatório e deve ser uma string.',
                    },
                  ],
                },
              },
            },
          },
          500: {
            description: 'Erro interno ao processar a mensagem com o agente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AgentErrorResponse' },
                example: {
                  success: false,
                  error: 'Erro interno ao processar a mensagem com o agente de IA.',
                },
              },
            },
          },
        },
      },
    },
  },
};
const { authMiddleware } = require('../middleware/auth');

async function proxyRoutes(fastify) {
  fastify.post('/auth/register', async (request, reply) => {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.body),
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.post('/auth/login', async (request, reply) => {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.body),
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.get('/usuarios', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/usuarios`, {
      headers: { Authorization: request.headers['authorization'] },
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.get('/usuarios/me/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(
      `${process.env.USER_SERVICE_URL}/usuarios/perfil/${request.params.id}`,
      {
        headers: { Authorization: request.headers['authorization'] },
      },
    );
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.patch('/usuarios/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/usuarios/${request.params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers['authorization'],
      },
      body: JSON.stringify(request.body),
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.get('/grupos', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.GROUPS_SERVICE_URL}/grupos`, {
      headers: { Authorization: request.headers['authorization'] },
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.post('/grupos', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.GROUPS_SERVICE_URL}/grupos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers['authorization'],
      },
      body: JSON.stringify(request.body),
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.get('/grupos/usuario/:userId', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(
      `${process.env.GROUPS_SERVICE_URL}/grupos/usuario/${request.params.userId}`,
      {
        headers: { Authorization: request.headers['authorization'] },
      },
    );
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.patch('/grupos/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.GROUPS_SERVICE_URL}/grupos/${request.params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers['authorization'],
      },
      body: JSON.stringify(request.body),
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.post('/grupos/:id/miembros', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(
      `${process.env.GROUPS_SERVICE_URL}/grupos/${request.params.id}/miembros`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers['authorization'],
        },
        body: JSON.stringify(request.body),
      },
    );
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.delete('/grupos/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.GROUPS_SERVICE_URL}/grupos/${request.params.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: request.headers['authorization'],
      },
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.get('/tickets', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.TICKETS_SERVICE_URL}/tickets`, {
      headers: { Authorization: request.headers['authorization'] },
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.post('/tickets', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.TICKETS_SERVICE_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers['authorization'],
      },
      body: JSON.stringify(request.body),
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.patch('/tickets/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(
      `${process.env.TICKETS_SERVICE_URL}/tickets/${request.params.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers['authorization'],
        },
        body: JSON.stringify(request.body),
      },
    );
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.delete('/tickets/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(
      `${process.env.TICKETS_SERVICE_URL}/tickets/${request.params.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: request.headers['authorization'] },
      },
    );
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.post(
    '/tickets/:id/comentarios',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const response = await fetch(
        `${process.env.TICKETS_SERVICE_URL}/tickets/${request.params.id}/comentarios`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: request.headers['authorization'],
          },
          body: JSON.stringify(request.body),
        },
      );
      const data = await response.json();
      return reply.status(response.status).send(data);
    },
  );

  fastify.get('/estados', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.TICKETS_SERVICE_URL}/estados`, {
      headers: { Authorization: request.headers['authorization'] },
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.get('/prioridades', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.TICKETS_SERVICE_URL}/prioridades`, {
      headers: { Authorization: request.headers['authorization'] },
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.get('/permisos', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/permisos`, {
      headers: { Authorization: request.headers['authorization'] },
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  fastify.delete('/usuarios/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/usuarios/${request.params.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: request.headers['authorization'],
      },
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });
}

module.exports = proxyRoutes;

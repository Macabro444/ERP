require('dotenv').config();
const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');
const proxyRoutes = require('./routes/proxy');

const PORT = process.env.PORT || 4000;

fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
});

const requestCounts = {};
fastify.addHook('onRequest', async (request, reply) => {
  const ip = request.ip;
  const now = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = { count: 1, start: now };
  } else {
    const elapsed = now - requestCounts[ip].start;
    if (elapsed > 60000) {
      requestCounts[ip] = { count: 1, start: now };
    } else {
      requestCounts[ip].count++;
      if (requestCounts[ip].count > 100) {
        return reply.status(429).send({
          statusCode: 429,
          intOpCode: 'SxGW429',
          data: { message: 'Too many requests' }
        });
      }
    }
  }
});

fastify.get('/health', async (request, reply) => {
  return {
    statusCode: 200,
    intOpCode: 'SxGW200',
    data: {
      service: 'api-gateway',
      status: 'running',
      port: PORT,
      services: {
        userService: process.env.USER_SERVICE_URL,
        groupsService: process.env.GROUPS_SERVICE_URL,
        ticketsService: process.env.TICKETS_SERVICE_URL
      }
    }
  };
});

fastify.register(proxyRoutes);

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`api-gateway corriendo en puerto ${PORT}`);
});
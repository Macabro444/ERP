require('dotenv').config();
const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');
const ticketsRoutes = require('./routes/tickets.routes');

const PORT = process.env.PORT || 3003;

fastify.register(cors, { origin: '*' });

fastify.get('/health', async (request, reply) => {
  return {
    statusCode: 200,
    intOpCode: 'SxTK200',
    data: { service: 'tickets-service', status: 'running', port: PORT }
  };
});

fastify.register(ticketsRoutes);

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`tickets-service corriendo en puerto ${PORT}`);
});
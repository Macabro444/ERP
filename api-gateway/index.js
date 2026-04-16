require('dotenv').config();
const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');
const proxyRoutes = require('./routes/proxy');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 4000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
});

// Rate limiting
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
          data: { message: 'Too many requests' },
        });
      }
    }
  }
});

// Logs centralizados
fastify.addHook('onResponse', async (request, reply) => {
  try {
    const usuarioId = request.user?.id ?? null;
    const ruta = '/' + request.url.split('/')[1];

    await supabase.from('logs').insert({
      servicio: 'api-gateway',
      metodo: request.method,
      ruta: ruta,
      status_code: reply.statusCode,
      usuario_id: usuarioId,
      ip: request.ip,
      duracion_ms: Math.round(reply.elapsedTime),
    });
  } catch (err) {
    console.error('Error guardando log:', err);
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
        ticketsService: process.env.TICKETS_SERVICE_URL,
      },
    },
  };
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  if (!body || body.length === 0) {
    done(null, {});
    return;
  }
  try {
    done(null, JSON.parse(body));
  } catch (err) {
    done(err);
  }
});

fastify.register(proxyRoutes);

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`api-gateway corriendo en puerto ${PORT}`);
});

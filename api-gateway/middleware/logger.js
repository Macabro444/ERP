const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const loggerMiddleware = async (request, reply, done) => {
  const start = Date.now();

  reply.then(() => {
    const duracion = Date.now() - start;
    const usuarioId = request.user?.id ?? null;

    supabase
      .from('logs')
      .insert({
        servicio: 'api-gateway',
        metodo: request.method,
        ruta: '/' + request.url.split('/')[1],
        status_code: reply.statusCode,
        usuario_id: usuarioId,
        ip: request.ip,
        duracion_ms: duracion,
      })
      .then(() => {});
  });

  done();
};

module.exports = { loggerMiddleware };

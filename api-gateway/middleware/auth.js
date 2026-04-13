const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const publicRoutes = [
  { method: 'POST', url: '/auth/register' },
  { method: 'POST', url: '/auth/login' },
];

const isPublicRoute = (method, url) => {
  return publicRoutes.some((r) => r.method === method && r.url === url);
};

const permisosRequeridos = {
  'POST /grupos': ['grupos.crear'],
  'PATCH /grupos': ['grupos.editar'],
  'DELETE /grupos': ['grupos.eliminar'],
  'GET /grupos': ['grupos.view'],
  'POST /tickets': ['tickets.crear'],
  'PATCH /tickets': [
    'ticket.editar',
    'ticket.finalizar',
    'ticket.editar-estado',
    'ticket.editar-descripcion',
  ],
  'DELETE /tickets': ['ticket.eliminar'],
  'GET /tickets': ['tickets.view'],
  'GET /usuarios': ['usuario.view'],
  'PATCH /usuarios': ['usuario.editar'],
  'DELETE /usuarios': ['usuario.eliminar'],
};

const authMiddleware = async (request, reply) => {
  const { method, url } = request;

  if (isPublicRoute(method, url)) return;

  const authHeader = request.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      statusCode: 401,
      intOpCode: 'SxGW401',
      data: { message: 'Token requerido' },
    });
  }

  const token = authHeader.split(' ')[1];

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return reply.status(401).send({
      statusCode: 401,
      intOpCode: 'SxGW401',
      data: { message: 'Token inválido o expirado' },
    });
  }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('permisos_globales')
    .eq('id', user.id)
    .single();

  const permisosIds = perfil?.permisos_globales ?? [];

  let nombresPermisos = [];
  if (permisosIds.length > 0) {
    const { data: permisosData } = await supabase
      .from('permisos')
      .select('nombre')
      .in('id', permisosIds);
    nombresPermisos = permisosData?.map((p) => p.nombre) ?? [];
  }

  const baseUrl = '/' + url.split('/')[1];
  const key = `${method} ${baseUrl}`;

  const permisoRequerido = permisosRequeridos[key];

  if (permisoRequerido) {
    const tienePermiso = permisoRequerido.some((p) => nombresPermisos.includes(p));
    if (!tienePermiso) {
      return reply.status(403).send({
        statusCode: 403,
        intOpCode: 'SxGW403',
        data: { message: 'No tienes permiso para realizar esta acción' },
      });
    }
  }

  request.user = user;
  request.nombresPermisos = nombresPermisos;
};

module.exports = { authMiddleware };

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function ticketsRoutes(fastify) {
  fastify.get('/tickets', async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          *,
          estados(nombre, color),
          prioridades(nombre, orden),
          grupos(nombre),
          autor:usuarios!tickets_autor_id_fkey(username, nombre_completo),
          asignado:usuarios!tickets_asignado_id_fkey(username, nombre_completo),
          comentarios( id, contenido, creado_en, autor:usuarios(username, nombre_completo))
        `,
        )
        .order('creado_en', { ascending: false });

      if (error) throw error;

      return reply.status(200).send({
        statusCode: 200,
        intOpCode: 'SxTK200',
        data,
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al obtener tickets' },
      });
    }
  });

  fastify.get('/tickets/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          *,
          estados(nombre, color),
          prioridades(nombre, orden),
          grupos(nombre),
          autor:usuarios!tickets_autor_id_fkey(username, nombre_completo),
          asignado:usuarios!tickets_asignado_id_fkey(username, nombre_completo),
          comentarios(
            id, contenido, creado_en,
            autor:usuarios(username, nombre_completo)
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return reply.status(404).send({
          statusCode: 404,
          intOpCode: 'SxTK404',
          data: { message: 'Ticket no encontrado' },
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        intOpCode: 'SxTK200',
        data,
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al obtener ticket' },
      });
    }
  });

  fastify.post('/tickets', async (request, reply) => {
    const {
      titulo,
      descripcion,
      grupo_id,
      estado_id,
      prioridad_id,
      autor_id,
      asignado_id,
      fecha_final,
    } = request.body;

    if (!titulo || !grupo_id || !estado_id || !prioridad_id) {
      return reply.status(400).send({
        statusCode: 400,
        intOpCode: 'SxTK400',
        data: { message: 'titulo, grupo_id, estado_id y prioridad_id son obligatorios' },
      });
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          titulo,
          descripcion,
          grupo_id,
          estado_id,
          prioridad_id,
          autor_id,
          asignado_id,
          fecha_final,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return reply.status(409).send({
            statusCode: 409,
            intOpCode: 'SxTK409',
            data: { message: 'Ya existe un ticket con ese título en el grupo' },
          });
        }
        if (error.code === 'P0001') {
          return reply.status(400).send({
            statusCode: 400,
            intOpCode: 'SxTK400',
            data: { message: error.message },
          });
        }
        throw error;
      }

      return reply.status(201).send({
        statusCode: 201,
        intOpCode: 'SxTK201',
        data,
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al crear ticket' },
      });
    }
  });

  fastify.patch('/tickets/:id', async (request, reply) => {
  const { id } = request.params;
  const { titulo, descripcion, estado_id, prioridad_id, asignado_id, fecha_final } = request.body;

  try {
    
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('asignado_id, autor_id')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return reply.status(404).send({
        statusCode: 404,
        intOpCode: 'SxTK404',
        data: { message: 'Ticket no encontrado' }
      });
    }

    
    const authHeader = request.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (token) {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );

      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      
      if (user) {
        const { data: perfil } = await supabaseAdmin
          .from('usuarios')
          .select('permisos_globales')
          .eq('id', user.id)
          .single();

        const permisosIds = perfil?.permisos_globales ?? [];
        const { data: permisosData } = await supabaseAdmin
          .from('permisos')
          .select('nombre')
          .in('id', permisosIds);
        
        const nombresPermisos = permisosData?.map(p => p.nombre) ?? [];
        const esAdmin = nombresPermisos.includes('ticket.editar');
        const esAsignado = ticket.asignado_id === user.id || ticket.autor_id === user.id;

        
        if (!esAdmin && !esAsignado) {
          return reply.status(403).send({
            statusCode: 403,
            intOpCode: 'SxTK403',
            data: { message: 'Solo puedes editar tickets asignados a ti' }
          });
        }
      }
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({ titulo, descripcion, estado_id, prioridad_id, asignado_id, fecha_final })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return reply.status(200).send({
      statusCode: 200,
      intOpCode: 'SxTK200',
      data,
    });
  } catch (err) {
    return reply.status(500).send({
      statusCode: 500,
      intOpCode: 'SxTK500',
      data: { message: 'Error al editar ticket' },
    });
  }
});

  fastify.delete('/tickets/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const { error } = await supabase.from('tickets').delete().eq('id', id);

      if (error) throw error;

      return reply.status(200).send({
        statusCode: 200,
        intOpCode: 'SxTK200',
        data: { message: 'Ticket eliminado correctamente' },
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al eliminar ticket' },
      });
    }
  });

  fastify.post('/tickets/:id/comentarios', async (request, reply) => {
    const { id } = request.params;
    const { contenido, autor_id } = request.body;

    if (!contenido || !autor_id) {
      return reply.status(400).send({
        statusCode: 400,
        intOpCode: 'SxTK400',
        data: { message: 'contenido y autor_id son obligatorios' },
      });
    }

    try {
      const { data, error } = await supabase
        .from('comentarios')
        .insert({ ticket_id: id, autor_id, contenido })
        .select()
        .single();

      if (error) throw error;

      return reply.status(201).send({
        statusCode: 201,
        intOpCode: 'SxTK201',
        data,
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al agregar comentario' },
      });
    }
  });

  fastify.get('/estados', async (request, reply) => {
    const { data, error } = await supabase.from('estados').select('*');
    if (error) return reply.status(500).send({ statusCode: 500, intOpCode: 'SxTK500', data: null });
    return reply.status(200).send({ statusCode: 200, intOpCode: 'SxTK200', data });
  });

  fastify.get('/prioridades', async (request, reply) => {
    const { data, error } = await supabase.from('prioridades').select('*').order('orden');
    if (error) return reply.status(500).send({ statusCode: 500, intOpCode: 'SxTK500', data: null });
    return reply.status(200).send({ statusCode: 200, intOpCode: 'SxTK200', data });
  });
}

module.exports = ticketsRoutes;

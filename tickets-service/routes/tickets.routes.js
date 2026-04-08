const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function ticketsRoutes(fastify) {

  fastify.get('/tickets', async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          estados(nombre, color),
          prioridades(nombre, orden),
          grupos(nombre),
          autor:usuarios!tickets_autor_id_fkey(username, nombre_completo),
          asignado:usuarios!tickets_asignado_id_fkey(username, nombre_completo),
          comentarios(id, contenido, creado_en)
        `)
        .order('creado_en', { ascending: false });

      if (error) throw error;

      return reply.status(200).send({
        statusCode: 200,
        intOpCode: 'SxTK200',
        data
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al obtener tickets' }
      });
    }
  });

  fastify.get('/tickets/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
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
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return reply.status(404).send({
          statusCode: 404,
          intOpCode: 'SxTK404',
          data: { message: 'Ticket no encontrado' }
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        intOpCode: 'SxTK200',
        data
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al obtener ticket' }
      });
    }
  });

  fastify.post('/tickets', async (request, reply) => {
    const { titulo, descripcion, grupo_id, estado_id, prioridad_id, autor_id, asignado_id, fecha_final } = request.body;

    if (!titulo || !grupo_id || !estado_id || !prioridad_id) {
      return reply.status(400).send({
        statusCode: 400,
        intOpCode: 'SxTK400',
        data: { message: 'titulo, grupo_id, estado_id y prioridad_id son obligatorios' }
      });
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({ titulo, descripcion, grupo_id, estado_id, prioridad_id, autor_id, asignado_id, fecha_final })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return reply.status(409).send({
            statusCode: 409,
            intOpCode: 'SxTK409',
            data: { message: 'Ya existe un ticket con ese título en el grupo' }
          });
        }
        if (error.code === 'P0001') {
          return reply.status(400).send({
            statusCode: 400,
            intOpCode: 'SxTK400',
            data: { message: error.message }
          });
        }
        throw error;
      }

      return reply.status(201).send({
        statusCode: 201,
        intOpCode: 'SxTK201',
        data
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al crear ticket' }
      });
    }
  });

  fastify.patch('/tickets/:id', async (request, reply) => {
    const { id } = request.params;
    const { titulo, descripcion, estado_id, prioridad_id, asignado_id, fecha_final } = request.body;

    try {
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
        data
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al editar ticket' }
      });
    }
  });

  fastify.delete('/tickets/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return reply.status(200).send({
        statusCode: 200,
        intOpCode: 'SxTK200',
        data: { message: 'Ticket eliminado correctamente' }
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al eliminar ticket' }
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
        data: { message: 'contenido y autor_id son obligatorios' }
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
        data
      });
    } catch (err) {
      return reply.status(500).send({
        statusCode: 500,
        intOpCode: 'SxTK500',
        data: { message: 'Error al agregar comentario' }
      });
    }
  });
}

module.exports = ticketsRoutes;
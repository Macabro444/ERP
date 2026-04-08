const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validateGrupo, validateMiembro } = require('../middleware/validate');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('grupos')
      .select(`
        *,
        creador:usuarios!grupos_creador_id_fkey(username, nombre_completo),
        miembros:grupo_miembros(
          usuario:usuarios(id, username, nombre_completo, email)
        )
      `)
      .order('creado_en', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      statusCode: 200,
      intOpCode: 'SxGR200',
      data
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxGR500',
      data: { message: 'Error al obtener grupos' }
    });
  }
});

router.post('/', validateGrupo, async (req, res) => {
  const { nombre, descripcion, nivel, creador_id } = req.body;

  try {
    const { data, error } = await supabase
      .from('grupos')
      .insert({ nombre, descripcion, nivel, creador_id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          statusCode: 409,
          intOpCode: 'SxGR409',
          data: { message: 'Ya existe un grupo con ese nombre' }
        });
      }
      throw error;
    }

    return res.status(201).json({
      statusCode: 201,
      intOpCode: 'SxGR201',
      data
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxGR500',
      data: { message: 'Error al crear grupo' }
    });
  }
});

router.patch('/:id', validateGrupo, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, nivel } = req.body;

  try {
    const { data, error } = await supabase
      .from('grupos')
      .update({ nombre, descripcion, nivel })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        statusCode: 404,
        intOpCode: 'SxGR404',
        data: { message: 'Grupo no encontrado' }
      });
    }

    return res.status(200).json({
      statusCode: 200,
      intOpCode: 'SxGR200',
      data
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxGR500',
      data: { message: 'Error al editar grupo' }
    });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('grupos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      statusCode: 200,
      intOpCode: 'SxGR200',
      data: { message: 'Grupo eliminado correctamente' }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxGR500',
      data: { message: 'Error al eliminar grupo' }
    });
  }
});

router.post('/:id/miembros', validateMiembro, async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  try {
    const { error } = await supabase
      .from('grupo_miembros')
      .insert({ grupo_id: id, usuario_id });

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          statusCode: 409,
          intOpCode: 'SxGR409',
          data: { message: 'El usuario ya es miembro del grupo' }
        });
      }
      throw error;
    }

    return res.status(201).json({
      statusCode: 201,
      intOpCode: 'SxGR201',
      data: { message: 'Miembro agregado correctamente' }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxGR500',
      data: { message: 'Error al agregar miembro' }
    });
  }
});

router.delete('/:id/miembros/:userId', async (req, res) => {
  const { id, userId } = req.params;

  try {
    const { error } = await supabase
      .from('grupo_miembros')
      .delete()
      .eq('grupo_id', id)
      .eq('usuario_id', userId);

    if (error) throw error;

    return res.status(200).json({
      statusCode: 200,
      intOpCode: 'SxGR200',
      data: { message: 'Miembro eliminado del grupo' }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxGR500',
      data: { message: 'Error al eliminar miembro' }
    });
  }
});

module.exports = router;
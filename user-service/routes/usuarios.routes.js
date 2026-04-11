const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // ← cambia ANON_KEY por SERVICE_KEY
);

// GET /usuarios/perfil/:id - obtener perfil propio
router.get('/perfil/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      statusCode: 200,
      intOpCode: 'SxUS200',
      data
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxUS500',
      data: { message: 'Error al obtener perfil' }
    });
  }
});

// GET /usuarios - listar todos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, username, email, permisos_globales');

    if (error) throw error;

    return res.status(200).json({
      statusCode: 200,
      intOpCode: 'SxUS200',
      data
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxUS500',
      data: { message: 'Error al obtener usuarios' }
    });
  }
});

// PATCH /usuarios/:id - actualizar perfil o permisos
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const cambios = req.body;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      statusCode: 200,
      intOpCode: 'SxUS200',
      data
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxUS500',
      data: { message: 'Error al actualizar usuario' }
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// GET /permisos - listar todos los permisos del catálogo
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('permisos')
      .select('*')
      .order('nombre');

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
      data: { message: 'Error al obtener permisos' }
    });
  }
});

module.exports = router;
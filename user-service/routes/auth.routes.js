const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validateRegister, validateLogin } = require('../middleware/validate');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post('/register', validateRegister, async (req, res) => {
  const { email, password, nombre, usuario, telefono, direccion, fechaNacimiento } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          usuario,
          telefono,
          direccion,
          fechaNacimiento,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        statusCode: 400,
        intOpCode: 'SxUS400',
        data: { message: error.message },
      });
    }

    return res.status(201).json({
      statusCode: 201,
      intOpCode: 'SxUS201',
      data: {
        message: 'Usuario registrado correctamente',
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxUS500',
      data: { message: 'Error interno del servidor' },
    });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        statusCode: 401,
        intOpCode: 'SxUS401',
        data: { message: 'Credenciales incorrectas' },
      });
    }

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('*, permisos_globales')
      .eq('id', data.user.id)
      .single();

    let nombresPermisos = [];
    if (perfil?.permisos_globales?.length > 0) {
      const { data: permisosData } = await supabase
        .from('permisos')
        .select('nombre')
        .in('id', perfil.permisos_globales);
      nombresPermisos = permisosData?.map((p) => p.nombre) ?? [];
    }

    return res.status(200).json({
      statusCode: 200,
      intOpCode: 'SxUS200',
      data: {
        token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre_completo: perfil?.nombre_completo,
          username: perfil?.username,
          permisos: nombresPermisos,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      intOpCode: 'SxUS500',
      data: { message: 'Error interno del servidor' },
    });
  }
});

module.exports = router;

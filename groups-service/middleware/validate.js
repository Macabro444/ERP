const validateGrupo = (req, res, next) => {
  const { nombre, nivel } = req.body;

  if (!nombre) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxGR400',
      data: { message: 'El nombre del grupo es obligatorio' }
    });
  }

  const nivelesValidos = ['Básico', 'Intermedio', 'Avanzado'];
  if (nivel && !nivelesValidos.includes(nivel)) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxGR401',
      data: { message: 'Nivel inválido. Debe ser Básico, Intermedio o Avanzado' }
    });
  }

  next();
};

const validateMiembro = (req, res, next) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxGR400',
      data: { message: 'El usuario_id es obligatorio' }
    });
  }

  next();
};

module.exports = { validateGrupo, validateMiembro };
const validateTicket = (req, res, next) => {
  const { titulo, grupo_id, estado_id, prioridad_id } = req.body;

  if (!titulo || !grupo_id || !estado_id || !prioridad_id) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxTK400',
      data: { message: 'titulo, grupo_id, estado_id y prioridad_id son obligatorios' },
    });
  }

  if (titulo.trim() === '') {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxTK401',
      data: { message: 'El título no puede estar vacío' },
    });
  }

  next();
};

const validateComentario = (req, res, next) => {
  const { contenido, autor_id } = req.body;

  if (!contenido || !autor_id) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxTK400',
      data: { message: 'contenido y autor_id son obligatorios' },
    });
  }

  if (contenido.trim() === '') {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxTK401',
      data: { message: 'El comentario no puede estar vacío' },
    });
  }

  next();
};

module.exports = { validateTicket, validateComentario };

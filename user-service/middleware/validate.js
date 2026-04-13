const validateRegister = (req, res, next) => {
  const { email, password, nombre, usuario, telefono, direccion, fechaNacimiento } = req.body;

  if (!email || !password || !nombre || !usuario || !telefono || !direccion || !fechaNacimiento) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxUS400',
      data: { message: 'Todos los campos son obligatorios' },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxUS401',
      data: { message: 'Formato de email inválido' },
    });
  }

  const telRegex = /^[0-9]{10}$/;
  if (!telRegex.test(telefono)) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxUS402',
      data: { message: 'El teléfono debe tener exactamente 10 dígitos numéricos' },
    });
  }

  const passRegex = /^(?=.*[!@#$%^&*]).{10,}$/;
  if (!passRegex.test(password)) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxUS403',
      data: {
        message: 'La contraseña debe tener mínimo 10 caracteres y al menos un símbolo (!@#$%^&*)',
      },
    });
  }

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  if (edad < 18) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxUS404',
      data: { message: 'Debes ser mayor de 18 años para registrarte' },
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxUS400',
      data: { message: 'Email y contraseña son obligatorios' },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: 'SxUS401',
      data: { message: 'Formato de email inválido' },
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };

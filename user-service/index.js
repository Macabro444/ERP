require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({
    statusCode: 200,
    intOpCode: 'SxUS200',
    data: { service: 'user-service', status: 'running', port: PORT }
  });
});

app.listen(PORT, () => {
  console.log(`user-service corriendo en puerto ${PORT}`);
});
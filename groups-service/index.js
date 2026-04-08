require('dotenv').config();
const express = require('express');
const cors = require('cors');
const groupsRoutes = require('./routes/groups.routes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/grupos', groupsRoutes);

app.get('/health', (req, res) => {
  res.json({
    statusCode: 200,
    intOpCode: 'SxGR200',
    data: { service: 'groups-service', status: 'running', port: PORT }
  });
});

app.listen(PORT, () => {
  console.log(`groups-service corriendo en puerto ${PORT}`);
});
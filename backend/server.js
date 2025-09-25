const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let invalidTokens = new Set();

app.post('/api/invalidate-token', (req, res) => {
  const { token } = req.body;
  if (token) {
    invalidTokens.add(token);
    res.status(200).send({ message: 'Token invalidado' });
  } else {
    res.status(400).send({ message: 'Token es requerido' });
  }
});

// Middleware para verificar el token en cada solicitud
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (invalidTokens.has(token)) {
    return res.status(401).send({ message: 'Token no es válido' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
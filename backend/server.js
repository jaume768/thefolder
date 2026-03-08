require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Confiar en el proxy inverso (Caddy) para X-Forwarded-For, req.ip, etc.
app.set('trust proxy', 1);

const { ensureRoleTags } = require('./utils/ensureTags');

connectDB()
  .then(async () => {
    await ensureRoleTags();
  })
  .catch((err) => {
    console.error('Error inicializando DB:', err);
  });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const allowedOrigins = [
  'https://thefolder.es',
  'https://www.thefolder.es',
  'https://admin.thefolder.es',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://localhost:3001'] : [])
];

app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS'));
    }
  },
  credentials: true
}));

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24h
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/magazines', require('./routes/magazines'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/industry', require('./routes/industry'));
app.use('/api/tags', require('./routes/tags'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;
  res.status(500).json({ error: message });
});

// 


// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

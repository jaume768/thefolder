const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Access token: corto, va en el header Authorization de cada petición.
const ACCESS_TOKEN_TTL = '30m';
// Refresh token: largo, sliding expiration (se renueva en cada uso).
// Si el usuario no vuelve a usar la app en 30 días, la sesión caduca de verdad.
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      professionalType: user.professionalType,
      accountType: user.accountType ?? null,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function generateRawRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

/**
 * Crea una sesión nueva (login) y devuelve el refresh token en claro.
 * Nunca se guarda en claro en la base de datos, solo su hash.
 */
async function issueRefreshToken(user, userAgent = '') {
  const rawToken = generateRawRefreshToken();
  const now = Date.now();

  const activeSessions = (user.sessions || []).filter((s) => s.expiresAt.getTime() > now);
  activeSessions.push({
    refreshTokenHash: hashToken(rawToken),
    expiresAt: new Date(now + REFRESH_TOKEN_TTL_MS),
    userAgent,
  });
  user.sessions = activeSessions;

  await user.save();
  return rawToken;
}

/**
 * Rota el refresh token de una sesión existente (llamado desde /api/auth/refresh).
 * Devuelve el nuevo refresh token en claro, o null si no hay ninguna sesión
 * activa que coincida (token inválido, ya usado, o caducado por inactividad).
 */
async function rotateRefreshToken(user, rawToken, userAgent = '') {
  const now = Date.now();
  const hash = hashToken(rawToken);
  const activeSessions = (user.sessions || []).filter((s) => s.expiresAt.getTime() > now);
  const idx = activeSessions.findIndex((s) => s.refreshTokenHash === hash);

  if (idx === -1) {
    user.sessions = activeSessions;
    await user.save();
    return null;
  }

  const newRawToken = generateRawRefreshToken();
  const previousCreatedAt = activeSessions[idx].createdAt;
  activeSessions[idx] = {
    refreshTokenHash: hashToken(newRawToken),
    expiresAt: new Date(now + REFRESH_TOKEN_TTL_MS),
    createdAt: previousCreatedAt,
    userAgent,
  };
  user.sessions = activeSessions;

  await user.save();
  return newRawToken;
}

/** Revoca una sesión concreta (logout explícito). */
async function revokeRefreshToken(user, rawToken) {
  const hash = hashToken(rawToken);
  user.sessions = (user.sessions || []).filter((s) => s.refreshTokenHash !== hash);
  await user.save();
}

module.exports = {
  ACCESS_TOKEN_TTL,
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
};

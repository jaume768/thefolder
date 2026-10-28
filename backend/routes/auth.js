const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { ensureAuthenticated } = require('../middlewares/auth');

const storage = multer.memoryStorage();
const imageFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se aceptan imágenes (JPEG, PNG, GIF, WebP).'), false);
    }
};
const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Demasiados intentos, inténtalo de nuevo en 15 minutos.' }
});

// /refresh tenía el mismo limitador que /login (15 cada 15 min por IP,
// compartidos): varias pestañas, varias personas tras la misma IP (oficina,
// universidad) o un login fallido de más agotaban el cupo, el refresh
// devolvía 429 y la sesión se cerraba. Limitador propio y más holgado.
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Demasiadas renovaciones de sesión, inténtalo de nuevo en unos minutos.' }
});

const codeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de verificación, inténtalo de nuevo en 1 hora.' }
});

// Registro
router.post('/register', upload.single('profilePicture'), authController.register);

// Login local
router.post('/login', authLimiter, authController.login);

// Login para administradores
router.post('/admin-login', authLimiter, authController.adminLogin);

// Verificar token de administrador
router.get('/verify-admin-token', authController.verifyAdminToken);

// Olvidé mi contraseña
router.post('/forgot-password', codeLimiter, authController.forgotPassword);

// Endpoint para verificar el código recibido
router.post('/verify-forgot-code', codeLimiter, authController.verifyForgotCode);

// Endpoint para restablecer la contraseña
router.post('/reset-password', codeLimiter, authController.resetPassword);

// Login con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.googleCallback);

router.post('/send-verification-code-pre-registration', codeLimiter, authController.sendVerificationCodePreRegistration);

// Endpoint para verificar el código y crear el usuario
router.post('/verify-code-pre-registration', codeLimiter, authController.verifyCodePreRegistration);

// Endpoint para reenviar el código
router.post('/resend-code-pre-registration', codeLimiter, authController.resendCodePreRegistration);

// Logout (revoca el refresh token de esta sesión/dispositivo)
router.post('/logout', authController.logout);

// Renueva el access token usando el refresh token (sliding session)
router.post('/refresh', refreshLimiter, authController.refresh);

// Completar registro desde el wizard (requiere JWT de fase 1)
router.post('/complete-registration', ensureAuthenticated, authController.completeRegistration);

module.exports = router;
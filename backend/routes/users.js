const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/auth');
const multer = require('multer');

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP).'), false);
    }
};

const documentFilter = (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF e imágenes.'), false);
    }
};

const uploadImage = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadDocument = multer({ storage, fileFilter: documentFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Conteo de creativos por nivel — público, sin auth
// GET /api/users/counts-by-level
router.get('/counts-by-level', async (req, res) => {
  try {
    const User = require('../models/User');
    const rows = await User.aggregate([
      { $match: { accountType: 'creative', creativeLevelName: { $in: ['professional', 'emerging', 'newcomer', 'graduated'] } } },
      { $group: { _id: '$creativeLevelName', count: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    res.json({
      professional: map.professional || 0,
      emerging:     map.emerging     || 0,
      students:     (map.newcomer || 0) + (map.graduated || 0),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching counts' });
  }
});

// Obtener perfil del usuario autenticado
router.get('/profile', ensureAuthenticated, userController.getProfile);

router.post('/check-availability', userController.checkAvailability);

// ✅ NUEVO (onboarding): comprobar si el username está libre con query
// GET /api/users/check-username?username=mariii
router.get(
  '/check-username',
  ensureAuthenticated,
  userController.checkUsernameAvailability
);

// Cambiar nombre de usuario
router.put('/change-username', ensureAuthenticated, userController.changeUsername);

// Actualizar perfil
router.put('/profile', ensureAuthenticated, userController.updateProfile);

// Actualización parcial whitelisteada (reclasificación, etc.)
router.patch('/me', ensureAuthenticated, userController.patchMe);
router.get('/profile/:username', userController.getProfileByUsername);
router.put('/change-password', ensureAuthenticated, userController.changePassword);

router.put('/profile-picture', ensureAuthenticated, uploadImage.single('file'), userController.updateProfilePicture);
router.delete('/profile-picture', ensureAuthenticated, userController.deleteProfilePicture);

// Rutas específicas para subir CV y Portfolio
router.put('/cv', ensureAuthenticated, uploadDocument.single('file'), userController.uploadCV);
router.put('/portfolio', ensureAuthenticated, uploadDocument.single('file'), userController.uploadPortfolio);

// Ruta para subir logo de empresa para experiencia profesional
router.post('/company-logo', ensureAuthenticated, uploadImage.single('file'), userController.uploadCompanyLogo);

// Ruta para subir logo de institución educativa
router.post('/institution-logo', ensureAuthenticated, uploadImage.single('file'), userController.uploadInstitutionLogo);

//Ruta actualizar portada de perfil usuario
router.put(
  "/featured-header/:variant", // variant = desktop | mobile
  ensureAuthenticated,
  uploadImage.single("file"),
  userController.updateFeaturedHeaderImageVariant
);

router.delete(
  "/featured-header/:variant",
  ensureAuthenticated,
  userController.deleteFeaturedHeaderImageVariant
);

//Ruta actualizar portada de buscador de creativos
router.put(
  "/creative-cover",
  ensureAuthenticated,
  uploadImage.single("file"),
  userController.updateCreativeCover
);

router.delete(
  "/creative-cover",
  ensureAuthenticated,
  userController.deleteCreativeCover
);

// Cambiar email
router.put('/change-email', ensureAuthenticated, userController.changeEmail);


router.delete('/profile', ensureAuthenticated, userController.deleteProfile);

router.get('/favorites', ensureAuthenticated, userController.getFavorites);
router.post('/favorites/:postId', ensureAuthenticated, userController.addFavorite);
router.delete('/favorites/:postId', ensureAuthenticated, userController.removeFavorite);

router.post('/saved-offers/:offerId', ensureAuthenticated, userController.saveOffer);
router.delete('/saved-offers/:offerId', ensureAuthenticated, userController.removeSavedOffer);
router.get('/saved-offers', ensureAuthenticated, userController.getSavedOffers);
router.get('/applied-offers', ensureAuthenticated, userController.getAppliedOffers);

// Rutas para seguir/dejar de seguir usuarios
router.post('/follow/:userId', ensureAuthenticated, userController.followUser);
router.delete('/follow/:userId', ensureAuthenticated, userController.unfollowUser);
router.get('/following', ensureAuthenticated, userController.getFollowing);
router.get('/followers', ensureAuthenticated, userController.getFollowers);
router.get('/check-follow/:userId', ensureAuthenticated, userController.checkFollow);
router.get('/searchUsers', ensureAuthenticated, userController.searchUsers);
router.get('/creatives', userController.getCreatives);
router.get('/creatives/facets', userController.getCreativesFacets);

// Ruta para verificar si un nombre de usuario existe
router.get('/check-username/:username', ensureAuthenticated, userController.checkUsernameExists);

// Ruta para búsqueda global
router.get('/search', userController.searchAll);

// Rutas para obtener ofertas de un usuario específico
router.get('/:userId/offers', userController.getUserOffers);
router.get('/:userId/educational-offers', userController.getUserEducationalOffers);

module.exports = router;
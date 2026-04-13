const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');
const multer = require('multer');

const storage = multer.memoryStorage();

// ✅ CAMBIO: límites reales para proteger tu servidor
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB por imagen (Sharp optimizará antes de subir)
    files: 6,                   // máximo 6 imágenes
  },
});

// ✅ CAMBIO: wrapper para devolver errores “bonitos” de multer
const uploadImagesWithErrors = (req, res, next) => {
  upload.array('images', 6)(req, res, (err) => {
    if (!err) return next();

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(413)
        .json({ message: 'Una o varias de tus imágenes supera el límite permitido (20MB).' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res
        .status(400)
        .json({ message: 'Máximo 6 imágenes por publicación.' });
    }

    // Otros errores
    return res.status(400).json({
      message: 'Error subiendo imágenes.',
      error: err.message,
    });
  });
};

// Crear post (con o sin imagen)
router.post('/', ensureAuthenticated, uploadImagesWithErrors, postController.createPost);

// Obtener posts de usuario
router.get('/user', ensureAuthenticated, postController.getUserPosts);

// Obtener posts por nombre de usuario
router.get('/user/:username', postController.getPostsByUsername);

// Obtener posts aleatorios
router.get('/home', postController.getRandomPosts);

// Obtener posts aleatorios excluyendo un post específico
router.get('/random', postController.getRandomPostsExcluding);

// Obtener posts para el explorador (sin autenticación)
router.get('/explorer', postController.getExplorerPosts);

// Tags de posts disponibles para filtrar en el explorador
router.get('/explorer/post-tags', postController.getExplorerPostTags);

// Faceted search para el explorador
router.get('/explorer/facets', postController.getExplorerFacets);

// Imagen de preview por projectType (para hover en filtros del explorador)
router.get('/tag-previews', postController.getTagPreviews);

// Obtener posts por tag
router.get('/tags/:tag', postController.getPostsByTag);

// *** Colocar rutas específicas antes de las rutas con parámetros genéricos ***
// Obtener posts seleccionados por el staff (sin autenticación)
router.get('/staff-picks', postController.getStaffPicks);

// Buscar posts (protegido)
router.get('/search', ensureAuthenticated, postController.searchPosts);

// Rutas que requieren un ID (estas se definen después para evitar conflictos)
router.get('/:id', postController.getPostById); // público: permite acceso a guests

// Nota: aquí tu update usa upload.single('image') y antes usabas memoryStorage.
// Lo dejo EXACTAMENTE como estaba (sin tocar tu lógica), pero ojo: aquí no tiene
// límites. Si quieres lo ajustamos luego.
router.put('/:id', ensureAuthenticated, upload.array('newImages', 6), postController.updatePost);

router.delete('/:id', ensureAuthenticated, postController.deletePost);

// Agregar o quitar post de staff picks (protegido)
router.put('/:id/staff-pick', ensureAuthenticated, ensureAdmin, postController.addStaffPick);
router.delete('/:id/staff-pick', ensureAuthenticated, ensureAdmin, postController.removeStaffPick);

module.exports = router;
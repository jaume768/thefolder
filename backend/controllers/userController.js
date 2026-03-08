const User = require('../models/User');
const Post = require('../models/Post');
const Offer = require('../models/Offer');
const EducationalOffer = require('../models/EducationalOffer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const bcrypt = require('bcryptjs');
const { validatePassword } = require('../utils/passwordValidation');
const { normalizeString, createNormalizedRegex, escapeRegex } = require('../utils/textUtils');
const mongoose = require('mongoose');  

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');
        
        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const userObj = user.toObject();
        userObj.hasPassword = !!user.googleId ? false : true;
        res.status(200).json(userObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkAvailability = async (req, res) => {
    const { username, email } = req.body;
    try {
        let errors = {};

        if (username) {
            const userByUsername = await User.findOne({ username });
            if (userByUsername) {
                errors.username = 'El nombre de usuario ya está en uso';
            }
        }

        if (email) {
            const userByEmail = await User.findOne({ email });
            if (userByEmail) {
                errors.email = 'El email ya está en uso';
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        return res.status(200).json({ message: 'Disponible' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res
            .status(400)
            .json({ error: "Nueva contraseña y su confirmación son requeridas." });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Las contraseñas nuevas no coinciden." });
    }
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) {
        return res.status(400).json({ error: pwCheck.error });
    }
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        if (user.googleId && (!user.password || user.password === "")) {
        } else {
            if (!currentPassword) {
                return res.status(400).json({ error: "La contraseña actual es requerida." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "La contraseña actual es incorrecta." });
            }
        }
        // Hasheamos la nueva contraseña y actualizamos el usuario
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Contraseña cambiada exitosamente." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
  try {
    // SEC-001: Whitelist de campos permitidos (previene mass assignment)
    const ALLOWED_FIELDS = [
      'username', 'fullName', 'role', 'dateOfBirth', 'country', 'city', 'customCountry',
      'referralSource', 'bio', 'biography', 'professionalTitle', 'profileHeadlines',
      'professionalTags', 'languages', 'coverTemplateDesktop', 'coverTemplateMobile',
      'galleryStyle', 'creativeType', 'formationType', 'institution', 'creativeOther',
      'brandName', 'professionalType', 'companyName', 'foundingYear', 'productServiceType',
      'sector', 'employeeRange', 'institutionName', 'institutionType', 'institutionOwnership',
      'agencyName', 'agencyServices', 'website', 'showNameCompany', 'showFoundingYearCompany',
      'education', 'skills', 'software', 'social', 'professionalMilestones', 'companyTags',
      'offersPractices', 'professionalFormation', 'profileCompleted', 'jobSearchActive',
      'contract', 'locationType', 'availability',
      'featuredHeaderImage', 'featuredHeaderImageDesktop', 'featuredHeaderImageMobile',
      'creativeCoverDesktop',
    ];
    const updates = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // ---------- Normalizaciones / límites ----------
    if (updates.professionalMilestones && !Array.isArray(updates.professionalMilestones)) {
      updates.professionalMilestones = [];
    }

    if (updates.companyTags && !Array.isArray(updates.companyTags)) {
      updates.companyTags = [];
    }

    if (Array.isArray(updates.companyTags) && updates.companyTags.length > 3) {
      updates.companyTags = updates.companyTags.slice(0, 3);
    }

    if (updates.offersPractices !== undefined) {
      updates.offersPractices = Boolean(updates.offersPractices);
    }

    if (updates.bio) updates.bio = String(updates.bio).substring(0, 150);
    if (updates.biography) updates.biography = String(updates.biography).substring(0, 450);

    if (updates.professionalTags) {
      if (!Array.isArray(updates.professionalTags)) updates.professionalTags = [];
      if (updates.professionalTags.length > 3) updates.professionalTags = updates.professionalTags.slice(0, 3);
    }

    if (updates.profileHeadlines !== undefined) {
    if (!Array.isArray(updates.profileHeadlines)) updates.profileHeadlines = ["", "", ""];

    updates.profileHeadlines = updates.profileHeadlines
        .map((x) => String(x || "").trim().slice(0, 40)); // 40 chars como en front

    // asegurar 3
    while (updates.profileHeadlines.length < 3) updates.profileHeadlines.push("");
    if (updates.profileHeadlines.length > 3) updates.profileHeadlines.length = 3;
    }

    if (updates.languages) {
      if (!Array.isArray(updates.languages)) updates.languages = [];
      if (updates.languages.length > 5) updates.languages = updates.languages.slice(0, 5);
    }

    // availability
    if (updates.availability !== undefined) {
      updates.availability = Array.isArray(updates.availability) ? updates.availability : [];
    }

    // ---------- Plantillas portada ----------
    const ALLOWED_COVER_TEMPLATES = [
    "fullscreen",
    "fullscreen-alt",
    "centered",
    "vertical-editorial",
    "vertical-centered",
    "split-top",
    "split-image",
    "vertical-card",
    ];

    if (updates.coverTemplateDesktop !== undefined) {
      const v = String(updates.coverTemplateDesktop || "").trim();
      if (ALLOWED_COVER_TEMPLATES.includes(v)) updates.coverTemplateDesktop = v;
      else delete updates.coverTemplateDesktop;
    }

    if (updates.coverTemplateMobile !== undefined) {
      const v = String(updates.coverTemplateMobile || "").trim();
      if (ALLOWED_COVER_TEMPLATES.includes(v)) updates.coverTemplateMobile = v;
      else delete updates.coverTemplateMobile;
    }

    // ---------- Estilo de galería ----------
    if (updates.galleryStyle !== undefined) {
    const v = String(updates.galleryStyle || "").trim();
    if (["gap", "nogap"].includes(v)) updates.galleryStyle = v;
    else delete updates.galleryStyle;
    }

    // ---------- Disponibilidad laboral ----------
    if (updates.jobSearchActive !== undefined) {
      updates.jobSearchActive = Boolean(updates.jobSearchActive);
    }

    if (updates.contract !== undefined) {
      const c = (updates.contract && typeof updates.contract === "object" && !Array.isArray(updates.contract))
        ? updates.contract
        : {};

      updates.contract = {
        practicas: Boolean(c.practicas),
        convenioPracticas: Boolean(c.convenioPracticas),
        tiempoCompleto: Boolean(c.tiempoCompleto),
        parcial: Boolean(c.parcial),
        freelance: Boolean(c.freelance),
      };
    }

    if (updates.locationType !== undefined) {
      const l = (updates.locationType && typeof updates.locationType === "object" && !Array.isArray(updates.locationType))
        ? updates.locationType
        : {};

      updates.locationType = {
        presencial: Boolean(l.presencial),
        remoto: Boolean(l.remoto),
        hibrido: Boolean(l.hibrido),
      };
    }

    // IMPORTANTE: usar $set + validators
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ message: "Perfil actualizado", user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }

    try {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'profile_pictures' },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 'profile.profilePicture': result.secure_url },
            { new: true }
        );

        res.status(200).json({ message: 'Foto actualizada', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

    exports.deleteProfilePicture = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { 'profile.profilePicture': "" },
        { new: true }
        );

        return res.status(200).json({
        message: "Foto de perfil eliminada",
        user: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
    };


exports.updateFeaturedHeaderImage = async (req, res) => {
    // 1. validar que haya archivo
    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }

    try {
        // 2. subimos a Cloudinary usando el mismo patrón de stream que ya usas
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'profile_headers' }, // <- carpeta distinta para portada
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        // 3. guardamos la URL en el usuario logueado
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { featuredHeaderImage: result.secure_url },
            { new: true }
        );

        // 4. devolvemos la URL nueva al front
        res.status(200).json({
            message: 'Imagen destacada actualizada',
            featuredHeaderImage: result.secure_url,
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateFeaturedHeaderImageVariant = async (req, res) => {
  const { variant } = req.params; // desktop | mobile
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const allowed = ["desktop", "mobile"];
  if (!allowed.includes(variant)) {
    return res.status(400).json({ error: "Invalid variant" });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "profile_headers" },
        (error, result) => (result ? resolve(result) : reject(error))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const field =
      variant === "desktop" ? "featuredHeaderImageDesktop" : "featuredHeaderImageMobile";

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { [field]: result.secure_url },
      { new: true }
    );

    return res.status(200).json({ message: "OK", url: result.secure_url, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// Función para editar foto de portada usuario
exports.deleteFeaturedHeaderImageVariant = async (req, res) => {
  const { variant } = req.params;
  const allowed = ["desktop", "mobile"];
  if (!allowed.includes(variant)) {
    return res.status(400).json({ error: "Invalid variant" });
  }

  const field =
    variant === "desktop" ? "featuredHeaderImageDesktop" : "featuredHeaderImageMobile";

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { [field]: "" },
      { new: true }
    );
    return res.status(200).json({ message: "Deleted", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Función para editar foto de buscardor de creativos
exports.updateCreativeCover = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "creative_covers" },
        (error, result) => (result ? resolve(result) : reject(error))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { creativeCoverDesktop: result.secure_url },
      { new: true }
    );

    return res.status(200).json({ message: "OK", url: result.secure_url, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteCreativeCover = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { creativeCoverDesktop: "" },
      { new: true }
    );
    return res.status(200).json({ message: "Deleted", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



// Función para subir el CV
exports.uploadCV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    try {
        // Verificamos si el usuario es una empresa (no puede subir CV)
        const user = await User.findById(req.user.id);
        if (user.professionalType === 1 || user.professionalType === 2 || user.professionalType === 4) {
            return res.status(403).json({ error: 'Las empresas no pueden subir CV' });
        }

        // Extraer el nombre original del archivo
        const originalFileName = req.file.originalname;

        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'cvs',
                        resource_type: 'raw',
                        format: 'pdf',
                        public_id: originalFileName.replace(/\.pdf$/i, '') // Mantener nombre original sin extensión
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        // Guardar tanto la URL como el nombre original
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                cvUrl: result.secure_url,
                cvFileName: originalFileName // Guardar el nombre original
            },
            { new: true }
        );

        res.status(200).json({
            message: 'CV subido correctamente',
            cvUrl: result.secure_url,
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para subir el Portfolio
exports.uploadPortfolio = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    try {
        // Verificamos si el usuario es una empresa (no puede subir Portfolio)
        const user = await User.findById(req.user.id);
        if (user.professionalType === 1 || user.professionalType === 2 || user.professionalType === 4) {
            return res.status(403).json({ error: 'Las empresas no pueden subir Portfolio' });
        }

        // Extraer el nombre original del archivo
        const originalFileName = req.file.originalname;

        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'portfolios',
                        resource_type: 'raw',
                        format: 'pdf',
                        public_id: originalFileName.replace(/\.pdf$/i, '') // Mantener nombre original sin extensión
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        // Guardar tanto la URL como el nombre original
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                portfolioUrl: result.secure_url,
                portfolioFileName: originalFileName // Guardar el nombre original
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Portfolio subido correctamente',
            portfolioUrl: result.secure_url,
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        // Realizar soft-delete: marcar la cuenta como inactiva
        await User.findByIdAndUpdate(req.user.id, { isActive: false });
        res.status(200).json({ message: 'Usuario desactivado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addFavorite = async (req, res) => {
    const postId = req.params.postId;
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Se requiere la URL de la imagen' });
    }

    try {
        // 1. Find the user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Initialize favorites array if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        // 3. Check if this exact favorite already exists
        const existingFavorite = user.favorites.find(fav => 
            fav.postId && 
            fav.postId.toString() === postId && 
            fav.savedImage === imageUrl
        );

        if (existingFavorite) {
            return res.status(200).json({ 
                message: 'La imagen ya está en favoritos', 
                favorites: user.favorites 
            });
        }

        // 4. Create new favorite
        const newFavorite = {
            postId: new mongoose.Types.ObjectId(postId), // Convert to ObjectId
            savedImage: imageUrl
            // savedAt will be added automatically by the schema
        };

        // 5. Add to favorites
        user.favorites.push(newFavorite);

        // 6. Save the user
        const savedUser = await user.save();
        
        return res.status(200).json({ 
            message: 'Imagen guardada en favoritos', 
            favorites: savedUser.favorites 
        });

    } catch (error) {
        return res.status(500).json({ 
            error: 'Error al guardar en favoritos',
            details: error.message 
        });
    }
};

exports.removeFavorite = async (req, res) => {
    const postId = req.params.postId;
    const { imageUrl } = req.body || {};

    try {
        const user = await User.findById(req.user.id);

        if (imageUrl) {
            user.favorites = user.favorites.filter(fav => {
                if (typeof fav === 'object' && fav.postId && fav.savedImage) {
                    return !(fav.postId.toString() === postId && fav.savedImage === imageUrl);
                }
                return true; // Mantener otros tipos de favoritos
            });
        } else {
            // Si no se proporciona una imagen específica, eliminar todos los favoritos de ese post
            user.favorites = user.favorites.filter(fav => {
                if (typeof fav === 'object' && fav.postId) {
                    return fav.postId.toString() !== postId;
                }
                return fav.toString() !== postId;
            });
        }

        await user.save();
        res.status(200).json({ message: 'Imagen removida de favoritos', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Asegurarse de que favorites exista y sea un array
        if (!user.favorites || !Array.isArray(user.favorites)) {
            return res.status(200).json({ favorites: [] });
        }

        // Procesar favoritos para incluir información completa del post
        const favorites = await Promise.all(user.favorites.map(async (fav) => {
            // Si es un objeto con savedImage
            if (typeof fav === 'object' && fav.savedImage) {
                const post = await Post.findById(fav.postId);
                if (!post) return null;

                return {
                    _id: fav._id || fav.postId, // Usar _id del favorito si existe, o postId como fallback
                    postId: fav.postId,
                    mainImage: fav.savedImage, // Usar la imagen guardada
                    savedImage: fav.savedImage, // Añadir explícitamente la imagen guardada
                    user: post.user,
                    title: post.title,
                    description: post.description,
                    createdAt: post.createdAt,
                    savedAt: fav.savedAt || new Date()
                };
            }
            // Si es solo un ID (caso antiguo)
            else {
                const postId = typeof fav === 'object' ? fav.postId : fav;
                const post = await Post.findById(postId);
                if (!post) return null;

                const mainImage = post.images && post.images.length > 0 ? post.images[0] : null;

                return {
                    _id: fav._id || postId,
                    postId: postId,
                    mainImage: mainImage,
                    savedImage: mainImage, // Para mantener consistencia con el nuevo formato
                    user: post.user,
                    title: post.title,
                    description: post.description,
                    createdAt: post.createdAt,
                    savedAt: new Date()
                };
            }
        }));

        // Filtrar valores nulos (posts que podrían haber sido eliminados)
        const validFavorites = favorites.filter(fav => fav !== null);

        // Ordenar por fecha de guardado (más reciente primero)
        validFavorites.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

        res.status(200).json({ favorites: validFavorites });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.saveOffer = async (req, res) => {
    const offerId = req.params.offerId;
    try {
        const user = await User.findById(req.user.id);
        if (!user.savedOffers.includes(offerId)) {
            user.savedOffers.push(offerId);
            await user.save();
        }
        res.status(200).json({ message: 'Oferta guardada', savedOffers: user.savedOffers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeSavedOffer = async (req, res) => {
    const offerId = req.params.offerId;
    try {
        const user = await User.findById(req.user.id);
        user.savedOffers = user.savedOffers.filter(o => o.toString() !== offerId);
        await user.save();
        res.status(200).json({ message: 'Oferta eliminada de guardadas', savedOffers: user.savedOffers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSavedOffers = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.savedOffers || !Array.isArray(user.savedOffers) || user.savedOffers.length === 0) {
            return res.status(200).json({ savedOffers: [] });
        }

        // Obtener detalles completos de las ofertas guardadas
        const offers = await Offer.find({ _id: { $in: user.savedOffers } });
        res.status(200).json({ savedOffers: offers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAppliedOffers = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Verificar si el usuario es de tipo creativo
        if (user.role !== 'Creativo') {
            return res.status(403).json({ error: 'Solo perfiles creativos pueden ver ofertas aplicadas' });
        }

        // Verificar si hay ofertas aplicadas
        if (!user.appliedOffers || !Array.isArray(user.appliedOffers) || user.appliedOffers.length === 0) {
            return res.status(200).json({ offers: [] });
        }

        // Obtener detalles completos de las ofertas aplicadas
        const offers = await Offer.find({ _id: { $in: user.appliedOffers } });
        res.status(200).json({ offers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfileByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si el usuario autenticado sigue a este perfil (comparación con toString)
        let isFollowing = false;
        if (req.user) {
            const currentUser = await User.findById(req.user.id);
            if (currentUser) {
                isFollowing = currentUser.following.some(f => f.toString() === user._id.toString());
            }
        }

        // Contar seguidores y seguidos
        const followingCount = user.following ? user.following.length : 0;
        const followersCount = user.followers ? user.followers.length : 0;

        const userProfile = user.toObject();
        userProfile.isFollowing = isFollowing;
        userProfile.followingCount = followingCount;
        userProfile.followersCount = followersCount;

        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Seguir a un usuario
exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verificar que el usuario a seguir existe
        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar que no se está intentando seguir a sí mismo
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
        }

        // Verificar si ya está siguiendo a este usuario (conversión a string)
        const currentUser = await User.findById(req.user.id);
        if (currentUser.following.some(f => f.toString() === userId)) {
            return res.status(400).json({ error: 'Ya estás siguiendo a este usuario' });
        }

        // Añadir al usuario a seguir en la lista de following del usuario actual
        await User.findByIdAndUpdate(req.user.id, {
            $push: { following: userId }
        });

        // Añadir al usuario actual en la lista de followers del usuario a seguir
        await User.findByIdAndUpdate(userId, {
            $push: { followers: req.user.id }
        });

        res.status(200).json({ message: 'Usuario seguido correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Dejar de seguir a un usuario
exports.unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verificar que el usuario a dejar de seguir existe
        const userToUnfollow = await User.findById(userId);
        if (!userToUnfollow) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si realmente está siguiendo a este usuario (conversión a string)
        const currentUser = await User.findById(req.user.id);
        if (!currentUser.following.some(f => f.toString() === userId)) {
            return res.status(400).json({ error: 'No estás siguiendo a este usuario' });
        }

        // Eliminar al usuario de la lista de following del usuario actual
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { following: userId }
        });

        // Eliminar al usuario actual de la lista de followers del usuario a dejar de seguir
        await User.findByIdAndUpdate(userId, {
            $pull: { followers: req.user.id }
        });

        res.status(200).json({ message: 'Has dejado de seguir al usuario correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener la lista de usuarios que el usuario actual sigue
exports.getFollowing = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user.id)
            .select('following')
            .populate({
                path: 'following',
                select: 'username fullName companyName professionalType professionalTitle professionalTags city country profile role',
                options: {
                    limit: limit,
                    skip: skip
                }
            });

        const count = await User.findById(req.user.id);
        const totalFollowing = count.following.length;

        res.status(200).json({
            following: user.following,
            totalFollowing,
            currentPage: page,
            totalPages: Math.ceil(totalFollowing / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener la lista de usuarios que siguen al usuario actual
exports.getFollowers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user.id)
            .select('followers')
            .populate({
                path: 'followers',
                select: 'username fullName companyName professionalType professionalTitle professionalTags city country profile role',
                options: {
                    limit: limit,
                    skip: skip
                }
            });

        const count = await User.findById(req.user.id);
        const totalFollowers = count.followers.length;

        res.status(200).json({
            followers: user.followers,
            totalFollowers,
            currentPage: page,
            totalPages: Math.ceil(totalFollowers / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verificar si el usuario actual sigue a otro usuario
exports.checkFollow = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user.id);
        // Convertir cada elemento a string para comparar correctamente
        const isFollowing = currentUser.following.some(f => f.toString() === userId);
        res.status(200).json({ isFollowing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { term } = req.query;
        if (!term || term.length < 2) {
            return res.status(400).json({ message: 'El término de búsqueda debe tener al menos 2 caracteres' });
        }

        const users = await User.find({
            username: { $regex: escapeRegex(term), $options: 'i' },
            isActive: true
        })
            .select('username profile.profilePicture')
            .limit(10);

        return res.status(200).json({
            users,
            message: 'Usuarios encontrados con éxito'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener usuarios creativos (con su último post)
exports.getCreatives = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      country,
      category,
      search,
      city,
      school,
      skills,
      graduationYear,
      professionalProfile,
      internships,
      sort = "new",          // "new" | "random"
      seed = "0",            // para random estable
    } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 9;

    // ✅ helpers multi-select: soporta ?city=A&city=B y ?city=A,B
    const toArray = (v) => {
      if (v === undefined || v === null || v === "") return [];
      if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
      return String(v).split(",").map(s => s.trim()).filter(Boolean);
    };

    const toRegexArray = (arr) => arr.map(v => createNormalizedRegex(v));

    // 1) Encontrar usuarios que tienen posts (y su lastPost)
    const postFilter = {};
    if (category) postFilter.categories = { $in: [category] };

    const usersWithPosts = await Post.aggregate([
      { $match: postFilter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          postCount: { $sum: 1 },
          lastPostId: { $first: "$_id" },
          lastPostImage: { $first: "$mainImage" },
          lastPostTitle: { $first: "$title" },
          lastPostDate: { $first: "$createdAt" },
        }
      },
      { $sort: { lastPostDate: -1 } }
    ]);

    const userIdsWithPosts = usersWithPosts.map(u => u._id);

    // 2) Filtro base
    let filter = {
      _id: { $in: userIdsWithPosts },
      isActive: true,
      professionalType: { $nin: [1, 2, 3, 4] },
    };

    const andClauses = [];

    // search
    if (search) {
      const normalizedSearchRegex = createNormalizedRegex(search);
      andClauses.push({
        $or: [
          { username: { $regex: normalizedSearchRegex } },
          { fullName: { $regex: normalizedSearchRegex } },
          { professionalTitle: { $regex: normalizedSearchRegex } },
          { biography: { $regex: normalizedSearchRegex } }
        ]
      });
    }

    // country
    const countriesArr = toArray(country);
    if (countriesArr.length) {
      const rx = toRegexArray(countriesArr);
      andClauses.push({ country: { $in: rx } });
    }

    // city
    const citiesArr = toArray(city);
    if (citiesArr.length) {
      const rx = toRegexArray(citiesArr);
      andClauses.push({ city: { $in: rx } });
    }

    // school
    const schoolsArr = toArray(school);
    if (schoolsArr.length) {
      const rx = toRegexArray(schoolsArr);
      andClauses.push({
        $or: [
          { "education.institution": { $in: rx } },
          { institution: { $in: rx } }
        ]
      });
    }

    // skills
    const skillsArr = toArray(skills);
    if (skillsArr.length) {
      const rx = toRegexArray(skillsArr);
      andClauses.push({
        $or: [
          { skills: { $in: rx } },
          { software: { $in: rx } }
        ]
      });
    }

    // ✅ graduationYear (tu schema real: formationEndYear)
    const gradYearsArr = toArray(graduationYear)
      .map(y => parseInt(String(y), 10))
      .filter(n => Number.isFinite(n));

    if (gradYearsArr.length) {
      andClauses.push({ "education.formationEndYear": { $in: gradYearsArr } });
    }

    // professionalProfile (front) -> professionalTags (mongo)
    const profArr = toArray(req.query.professionalProfile ?? req.query.professionalTags);
    if (profArr.length) {
    andClauses.push({ professionalTags: { $in: profArr } });
    }

    // internships
    if (internships === "true") {
      // si "internships" significa practicas:
      filter["contract.practicas"] = true;

      // si en realidad quieres convenio:
      // filter["contract.convenioPracticas"] = true;
    }

    if (andClauses.length) filter.$and = andClauses;

    // 3) total
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNumber);
    const skip = (pageNumber - 1) * limitNumber;

    // 4) lógica de pin del usuario logueado (solo page 1)
    const meId = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : null;
    const includeMe = Boolean(meId) && pageNumber === 1;

    // Si NO es page 1, excluimos me para que no salga repetido
    if (meId && !includeMe) {
      filter._id = {
        $in: userIdsWithPosts.filter(id => id.toString() !== meId.toString())
      };
    }

    // 5) RANDOM estable sin randomKey
    const seedInt = Math.abs(parseInt(seed, 10)) || 0;
    const seedNorm = (seedInt % 1000000) / 1000000; // 0..1

    // new vs random
    const wantRandom = sort === "random";

    const pipeline = [
      { $match: filter },

      ...(wantRandom
        ? [
            // _rand = (rand + seed) % 1  -> orden estable por seed (no perfecto pero funciona muy bien)
            { $addFields: { _rand: { $mod: [{ $add: [{ $rand: {} }, seedNorm] }, 1] } } },
            { $sort: { _rand: 1, _id: 1 } },
          ]
        : [
            { $sort: { createdAt: -1 } }
          ]
      ),

      { $skip: skip },
      { $limit: limitNumber },

      {
        $project: {
          username: 1,
          fullName: 1,
          country: 1,
          professionalTitle: 1,
          "profile.profilePicture": 1,
          skills: 1,
          professionalTags: 1,
          city: 1,
          creativeCoverDesktop: 1,
          updatedAt: 1,
        }
      }
    ];

    let users = await User.aggregate(pipeline);

    // 6) Pin de mi perfil primero (si cumple filtros)
    if (includeMe) {
      const meDoc = await User.findOne({ ...filter, _id: meId })
        .select("username fullName country professionalTitle profile.profilePicture skills professionalTags city creativeCoverDesktop updatedAt")
        .lean();

      if (meDoc) {
        users = [meDoc, ...users.filter(u => String(u._id) !== String(meDoc._id))];
        users = users.slice(0, limitNumber);
      }
    }

    // 7) Añadir lastPost
    const usersWithLastPost = users.map(user => {
      const info = usersWithPosts.find(p => p._id.toString() === user._id.toString());
      return {
        ...user,
        lastPost: info ? {
          _id: info.lastPostId,
          mainImage: info.lastPostImage,
          title: info.lastPostTitle
        } : null
      };
    });

    // 8) countries/cities
    const countries = await User.distinct("country", { isActive: true });
    const cities = await User.distinct("city", { isActive: true });

    return res.status(200).json({
      creatives: usersWithLastPost,
      totalPages,
      currentPage: pageNumber,
      totalCreatives: total,
      countries: countries.filter(Boolean),
      cities: cities.filter(Boolean),
    });

  } catch (error) {
    return res.status(500).json({
      error: "Error al obtener creativos",
      message: error.message,
    });
  }
};


exports.uploadPdf = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se ha proporcionado ningún archivo' });
    }

    const { type } = req.body;
    if (!type || (type !== 'cv' && type !== 'portfolio')) {
        return res.status(400).json({ success: false, error: 'Tipo de documento no válido' });
    }

    try {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: `user_documents/${type}`,
                        resource_type: 'auto',
                        format: 'pdf',
                        public_id: `${req.user.id}_${type}_${Date.now()}`,
                        transformation: { flags: "attachment" }
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        // Usar directamente la URL segura proporcionada por Cloudinary
        const fileUrl = result.secure_url;

        // Actualizar el campo correspondiente en el usuario
        const updateField = type === 'cv' ? { cvUrl: fileUrl } : { portfolioUrl: fileUrl };

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateField,
            { new: true }
        );

        res.status(200).json({
            success: true,
            fileUrl: fileUrl,
            message: `${type === 'cv' ? 'CV' : 'Portfolio'} subido correctamente`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Obtener ofertas de trabajo de un usuario específico
exports.getUserOffers = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el ID del usuario'
            });
        }

        // Verificar si el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Evitar mostrar ofertas de usuarios de tipo 4 (instituciones educativas)
        if (user.professionalType === 4) {
            return res.status(200).json({
                success: true,
                offers: []
            });
        }

        // Buscar ofertas de trabajo del usuario
        const Offer = require('../models/Offer');
        const offers = await Offer.find({ publisher: userId })
            .sort({ publicationDate: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            offers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las ofertas del usuario',
            error: error.message
        });
    }
};

// Obtener ofertas educativas de un usuario específico
exports.getUserEducationalOffers = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el ID del usuario'
            });
        }

        // Verificar si el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Solo mostrar ofertas educativas para usuarios de tipo 4 (instituciones educativas)
        if (user.professionalType !== 4) {
            return res.status(200).json({
                success: true,
                offers: []
            });
        }

        // Buscar ofertas educativas del usuario
        const EducationalOffer = require('../models/EducationalOffer');
        const offers = await EducationalOffer.find({ publisher: userId })
            .sort({ publicationDate: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            offers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las ofertas educativas del usuario',
            error: error.message
        });
    }
};

exports.searchAll = async (req, res) => {
    try {
        const { query, searchByFullName, searchByUsername, includePosts, includeUserPosts } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'La búsqueda debe tener al menos 2 caracteres' });
        }

        const regex = new RegExp(escapeRegex(query), 'i');

        // Configurar condiciones de búsqueda para usuarios según parámetros
        let userSearchCriteria = [];

        // Siempre incluir estos campos en la búsqueda
        userSearchCriteria.push({ companyName: regex });
        userSearchCriteria.push({ professionalTitle: regex });
        userSearchCriteria.push({ biography: regex });

        // Incluir búsqueda por nombre completo si se solicita
        if (searchByFullName !== 'false') {
            userSearchCriteria.push({ fullName: regex });
        }

        // Incluir búsqueda por username si se solicita
        if (searchByUsername !== 'false') {
            userSearchCriteria.push({ username: regex });
        }

        // Búsqueda de usuarios
        const users = await User.find({
            $or: userSearchCriteria,
            isActive: true
        })
            .select('username fullName professionalTitle companyName role professionalType profile.profilePicture')
            .limit(10);

        // Obtener IDs de usuarios encontrados para buscar sus publicaciones
        const userIds = users.map(user => user._id);

        // Búsqueda de posts por contenido
        let postQueries = [
            { title: regex },
            { description: regex },
            { tags: regex }
        ];

        // Si se solicita incluir posts de usuarios encontrados
        if (includeUserPosts === 'true' && userIds.length > 0) {
            postQueries.push({ user: { $in: userIds } });
        }

        // Búsqueda de posts
        const posts = await Post.find({
            $or: postQueries
        })
            .populate('user', 'username fullName companyName profile.profilePicture')
            .select('title description mainImage createdAt')
            .sort({ createdAt: -1 })
            .limit(20); // Aumentamos el límite para mostrar más posts

        // Búsqueda de ofertas de trabajo
        const offers = await Offer.find({
            $or: [
                { position: regex },
                { companyName: regex },
                { description: regex },
                { city: regex },
                { tags: regex }
            ],
            status: 'accepted'
        })
            .select('companyName position city publicationDate companyLogo')
            .sort({ publicationDate: -1 })
            .limit(10);

        // Búsqueda de ofertas educativas
        const educationalOffers = await EducationalOffer.find({
            $or: [
                { programName: regex },
                { description: regex },
                { knowledgeArea: regex },
                { 'location.city': regex },
                { 'location.country': regex }
            ],
            status: 'accepted'
        })
            .select('programName studyType knowledgeArea modality startDate images')
            .sort({ publicationDate: -1 })
            .limit(10);

        return res.status(200).json({
            results: {
                users,
                posts,
                offers,
                educationalOffers
            },
            message: 'Búsqueda completada con éxito'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Check if a username exists
exports.checkUsernameExists = async (req, res) => {
  try {
    const raw = req.params.username || "";
    const username = String(raw).trim().replace(/^@/, "");

    const user = await User.findOne({ username }).select("profile.profilePicture");
    return res.status(200).json({
      exists: !!user,
      profilePicture: user?.profile?.profilePicture || null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// Función para subir logo de empresa para experiencia profesional
exports.uploadCompanyLogo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    try {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'company_logos' },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);
        
        res.status(200).json({ 
            message: 'Logo subido correctamente', 
            logoUrl: result.secure_url 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Check username availability (onboarding)
// Devuelve available=true si:
// - no existe
// - existe pero es del usuario actual (cuando vuelves atrás)
exports.checkUsernameAvailability = async (req, res) => {
  try {
    const raw = req.query.username || "";
    const username = String(raw).trim().replace(/^@/, "");

    if (!username) {
      return res.status(400).json({ error: "username requerido" });
    }

    const user = await User.findOne({ username }).select("_id username");

    // No existe → disponible
    if (!user) {
      return res.status(200).json({ available: true });
    }

    // Existe pero es mío → disponible (clave para tu bug al volver atrás)
    if (req.user?.id && String(user._id) === String(req.user.id)) {
      return res.status(200).json({ available: true, mine: true });
    }

    // Existe y no es mío → no disponible
    return res.status(200).json({ available: false });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



// Función para subir logo de institución educativa
exports.uploadInstitutionLogo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    try {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'institution_logos' },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);
        
        res.status(200).json({ 
            message: 'Logo de institución subido correctamente', 
            logoUrl: result.secure_url 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Cambiar email del usuario autenticado
exports.changeEmail = async (req, res) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !newEmail.includes("@")) {
    return res.status(400).json({ error: "El email no es válido." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    // Si el usuario tiene contraseña (no es solo Google), verificarla
    if (user.password && user.password.trim() !== "") {
      if (!password) {
        return res.status(400).json({ error: "Debes confirmar tu contraseña actual." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "La contraseña actual es incorrecta." });
      }
    }

    // Verificar que el email no está en uso por otro usuario
    const existing = await User.findOne({ email: newEmail.toLowerCase().trim() });
    if (existing && existing._id.toString() !== req.user.id) {
      return res.status(400).json({ error: "Este email ya está en uso por otra cuenta." });
    }

    user.email = newEmail.toLowerCase().trim();
    await user.save();

    return res.status(200).json({ message: "Email actualizado correctamente.", email: user.email });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
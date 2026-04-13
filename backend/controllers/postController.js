const Post = require('../models/Post');
const User = require('../models/User');
const { uploadFile } = require('../utils/storageService');
const mongoose = require('mongoose');
const { escapeRegex } = require('../utils/textUtils');
const { processImageIfNeeded } = require('../utils/imageProcessor');

exports.createPost = async (req, res) => {
    try {
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            // Procesamos cada imagen
            for (const file of req.files) {
                const buf = await processImageIfNeeded(file.buffer);
                const { url: _imgUrl } = await uploadFile(buf, 'posts');
                imageUrls.push(_imgUrl);
            }
        }
        // Procesar etiquetas y demás datos enviados (convertir de JSON)
        const peopleTags = req.body.peopleTags ? JSON.parse(req.body.peopleTags) : [];
        const imageTags = req.body.imageTags ? JSON.parse(req.body.imageTags) : {};
        const tags = req.body.tags
            ? (typeof req.body.tags === 'string'
                ? req.body.tags.split(',').map((tag) => tag.trim())
                : req.body.tags)
            : [];
        const projectTypes = req.body.projectTypes
            ? JSON.parse(req.body.projectTypes).filter(t => typeof t === 'string' && t.trim())
            : [];

        const newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            description: req.body.description,
            authorRole: (req.body.authorRole || '').trim(),
            images: imageUrls,
            mainImage: imageUrls[0] || '',
            tags,
            peopleTags,
            imageTags,
            projectTypes,
        });
        await newPost.save();
        res.status(201).json({ message: 'Post creado', post: newPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRandomPosts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    try {
        const posts = await Post.aggregate([{ $sample: { size: limit } }]);
        // Se hace un populate manual de los posts obtenidos
        const postsWithUser = await Post.populate(posts, { path: 'user', select: 'fullName city city2 country2' });
        res.status(200).json({ posts: postsWithUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener posts aleatorios excluyendo un post específico
exports.getRandomPostsExcluding = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const excludeId = req.query.exclude;

        let query = {};

        // Si hay un ID para excluir, lo añadimos a la consulta
        if (excludeId) {
            // Verificamos si el ID es válido para evitar errores
            if (!mongoose.Types.ObjectId.isValid(excludeId)) {
                return res.status(400).json({ error: 'ID de post inválido' });
            }
            query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
        }

        // Obtenemos posts aleatorios excluyendo el post especificado
        const posts = await Post.aggregate([
            { $match: query },
            { $sample: { size: limit } }
        ]);

        // Hacemos un populate manual para incluir información del usuario
        const postsWithUser = await Post.populate(posts, {
            path: 'user',
            select: 'username profile fullName companyName city country city2 country2 professionalTags'
        });

        res.status(200).json({ posts: postsWithUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPostsByTag = async (req, res) => {
    const { tag } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    try {
        const posts = await Post.find({ tags: tag })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user');
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user');
        if (!post) return res.status(404).json({ message: 'Post no encontrado' });
        
        // Verificar si el usuario existe (podría haber sido eliminado)
        if (!post.user) {
            return res.status(404).json({ message: 'El post pertenece a un usuario que ya no existe en la plataforma' });
        }
        
        res.status(200).json({ post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un post
exports.updatePost = async (req, res) => {
    try {
        const updateData = {};

        if (req.body.title !== undefined) updateData.title = req.body.title;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.authorRole !== undefined) updateData.authorRole = (req.body.authorRole || '').trim();
        if (req.body.peopleTags) updateData.peopleTags = JSON.parse(req.body.peopleTags);
        if (req.body.imageTags) updateData.imageTags = JSON.parse(req.body.imageTags);
        if (req.body.projectTypes !== undefined) {
            updateData.projectTypes = JSON.parse(req.body.projectTypes).filter(t => typeof t === 'string' && t.trim());
        }

        // Existing images kept by the user after possible deletions
        let existingImages = req.body.images ? JSON.parse(req.body.images) : null;

        // Upload any new image files sent as newImages[]
        if (req.files && req.files.length > 0) {
            const slots = 6 - (existingImages || []).length;
            const filesToUpload = req.files.slice(0, Math.max(0, slots));
            const newUrls = [];
            for (const file of filesToUpload) {
                const buf = await processImageIfNeeded(file.buffer);
                const { url: _imgUrl } = await uploadFile(buf, 'posts');
                newUrls.push(_imgUrl);
            }
            existingImages = (existingImages || []).concat(newUrls);
        }

        if (existingImages !== null) {
            updateData.images = existingImages;
            updateData.mainImage = existingImages[0] || '';
        }

        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            updateData,
            { new: true }
        ).populate('user');

        if (!post) return res.status(404).json({ message: 'Post no encontrado o no autorizado' });
        res.status(200).json({ message: 'Post actualizado', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!post) return res.status(404).json({ message: 'Post no encontrado o no autorizado' });
        res.status(200).json({ message: 'Post eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getStaffPicks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    let posts = await Post.aggregate([
      {
        $match: {
          staffPick: true,
          images: { $exists: true, $ne: [] },
        },
      },
      { $sample: { size: limit } },
    ]);

    posts = await Post.populate(posts, {
      path: "user",
      select: "username profile fullName companyName city country professionalTags",
    });

    // Quita posts cuyo usuario ya no existe (populate => null)
    posts = posts.filter((p) => p.user);

    const postImages = [];

    posts.forEach((post) => {
      if (!Array.isArray(post.images)) return;

      const u = post.user || {}; // seguridad extra

      post.images.forEach((imageUrl) => {
        postImages.push({
          imageUrl,
          postId: post._id,
          postTitle: post.title,
          user: {
            username: u.username || "Usuario eliminado",
            fullName: u.fullName || null,
            companyName: u.companyName || null,
            professionalTags: u.professionalTags || [],
            profilePicture: u.profile?.profilePicture || null,
            city: u.city || null,
            country: u.country || null,
          },
          peopleTags: post.peopleTags || [],
        });
      });
    });

    const totalPosts = await Post.countDocuments({
      staffPick: true,
      images: { $exists: true, $ne: [] },
    });

    // Ojo: esto no es paginación real porque estás usando $sample,
    // pero lo dejamos igual que lo tenías.
    const hasMore = totalPosts > posts.length;

    res.status(200).json({
      images: postImages,
      hasMore,
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.addStaffPick = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { staffPick: true },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: "Post no encontrado" });
        res.status(200).json({ message: "Post marcado como Staff Pick", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeStaffPick = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { staffPick: false },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: "Post no encontrado" });
        res.status(200).json({ message: "Post removido de Staff Picks", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchPosts = async (req, res) => {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    try {
        const regex = new RegExp(escapeRegex(query), 'i');
        const posts = await Post.find({
            $or: [
                { description: regex },
                { tags: regex }
            ]
        })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user');

        const total = await Post.countDocuments({
            $or: [
                { description: regex },
                { tags: regex }
            ]
        });

        res.status(200).json({ total, posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener posts por nombre de usuario
exports.getPostsByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const limit = parseInt(req.query.limit) || 0; // 0 = sin límite

        const User = require('../models/User');
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        let query = Post.find({ user: user._id.toString() }).sort({ createdAt: -1 });
        if (limit > 0) query = query.limit(limit);
        const posts = await query;
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getExplorerPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const viewedPostIds = req.query.exclude
            ? req.query.exclude.split(',').filter(id => id).map(id => {
                try {
                    return new mongoose.Types.ObjectId(id.trim());
                } catch (e) {
                    return null;
                }
            }).filter(id => id)
            : [];

        // ── Filtros por propiedades del autor ─────────────────────────────
        const toArr = val => !val ? [] : Array.isArray(val) ? val : [val];
        const cityArr         = toArr(req.query.city);
        const countryArr      = toArr(req.query.country);
        const levelArr        = toArr(req.query.creativeLevel).map(Number).filter(n => [1,2,3,4,5].includes(n));
        const tagArr          = toArr(req.query.professionalProfile);
        const projectTypeArr  = toArr(req.query.projectType);
        const postTagArr      = toArr(req.query.postTag);

        const hasUserFilters = cityArr.length || countryArr.length || levelArr.length || tagArr.length;

        let userIdFilter = null;
        if (hasUserFilters) {
            const userQuery = {};
            if (cityArr.length) {
              const cityRx = cityArr.map(c => new RegExp(`^${escapeRegex(c)}$`, 'i'));
              userQuery.$or = [{ city: { $in: cityRx } }, { city2: { $in: cityRx } }];
            }
            if (countryArr.length) userQuery.country = { $in: countryArr.map(c => new RegExp(`^${escapeRegex(c)}$`, 'i')) };
            if (levelArr.length)   userQuery.creativeLevel    = { $in: levelArr };
            if (tagArr.length)     userQuery.professionalTags = { $in: tagArr };
            const matchingUsers = await User.find(userQuery).select('_id');
            userIdFilter = matchingUsers.map(u => u._id);
        }
        // ─────────────────────────────────────────────────────────────────

        const matchStage = {
            images: { $exists: true, $ne: [] },
            hiddenFromExplorer: { $ne: true },
            ...(viewedPostIds.length > 0   && { _id:          { $nin: viewedPostIds }    }),
            ...(userIdFilter !== null       && { user:         { $in: userIdFilter }      }),
            ...(projectTypeArr.length > 0  && { projectTypes: { $in: projectTypeArr }    }),
            ...(postTagArr.length > 0      && { tags:         { $in: postTagArr }         }),
        };

        let posts = await Post.aggregate([
            { $match: matchStage },
            { $sample: { size: limit } }
        ]);

        posts = await Post.populate(posts, {
            path: 'user',
            select: 'username profile fullName companyName city country city2 country2 professionalTags'
        });

        let postImages = [];
        posts.forEach(post => {
            if (!post.user) return;
            post.images.forEach(imageUrl => {
                postImages.push({
                    imageUrl,
                    postId: post._id,
                    postTitle: post.title,
                    user: {
                        username:        post.user.username || 'Usuario eliminado',
                        fullName:        post.user.fullName || null,
                        companyName:     post.user.companyName || null,
                        professionalTags: post.user.professionalTags || [],
                        profilePicture:  post.user.profile?.profilePicture || null,
                        city:            post.user.city || null,
                        country:         post.user.country || null
                    },
                    peopleTags: post.peopleTags || []
                });
            });
        });

        const totalPosts = await Post.countDocuments({
            images: { $exists: true, $ne: [] },
            hiddenFromExplorer: { $ne: true },
            ...(viewedPostIds.length > 0  && { _id:          { $nin: viewedPostIds }    }),
            ...(userIdFilter !== null      && { user:         { $in: userIdFilter }      }),
            ...(projectTypeArr.length > 0  && { projectTypes: { $in: projectTypeArr }    }),
            ...(postTagArr.length > 0      && { tags:         { $in: postTagArr }         }),
        });
        const hasMore = totalPosts > posts.length;

        res.status(200).json({ images: postImages, hasMore, totalPosts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const EXPLORER_PROJECT_TYPES = [
    'Advertising', 'Art Direction', 'Backstage', 'Beauty',
    'Brand Content', 'Campaign', 'Conceptual', 'Cover', 'E-commerce',
    'Editorial', 'Fashion Film', 'Graphic', 'Lookbook', 'Portrait', 'Product',
    'Show/Runway', 'Social Media', 'Still Life', 'Street Style', 'Test Shoot',
];

// ── GET /api/posts/explorer/facets ───────────────────────────────────────────
// Faceted search para el Explorer: conteos por dimensión excluyendo la propia.
// Dimensiones de usuario (city, professionalProfile, creativeLevel) + projectType de post.
exports.getExplorerFacets = async (req, res) => {
    try {
        const toArr = (v) => {
            if (!v) return [];
            if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
            return String(v).split(',').map(s => s.trim()).filter(Boolean);
        };

        const cityArr  = toArr(req.query.city);
        const tagArr   = toArr(req.query.professionalProfile);
        const levelArr = toArr(req.query.creativeLevel).map(Number).filter(n => [1,2,3,4].includes(n));

        // IDs de usuarios que tienen al menos un post visible en el explorador
        const usersWithVisiblePosts = await Post.distinct('user', {
            images: { $exists: true, $ne: [] },
            hiddenFromExplorer: { $ne: true },
        });

        const buildUserFilter = ({ skipCity = false, skipTags = false, skipLevel = false } = {}) => {
            const f = { isActive: true, _id: { $in: usersWithVisiblePosts } };
            const and = [];
            if (!skipCity && cityArr.length) {
                const rx = cityArr.map(v => new RegExp(escapeRegex(v), 'i'));
                and.push({ $or: [{ city: { $in: rx } }, { city2: { $in: rx } }] });
            }
            if (!skipTags && tagArr.length) {
                and.push({ professionalTags: { $in: tagArr } });
            }
            if (!skipLevel && levelArr.length) {
                and.push({ creativeLevel: { $in: levelArr } });
            }
            if (and.length) f.$and = and;
            return f;
        };

        // IDs de usuarios que cumplen TODOS los filtros de usuario (para projectType)
        const fullMatchIds = await User.distinct('_id', buildUserFilter());

        const [tagAgg, cityAgg1, cityAgg2, levelAgg, typeAgg] = await Promise.all([
            // Tags: aplica ciudad + nivel, cuenta por tag
            User.aggregate([
                { $match: buildUserFilter({ skipTags: true }) },
                { $unwind: { path: '$professionalTags', preserveNullAndEmptyArrays: false } },
                { $group: { _id: '$professionalTags', count: { $sum: 1 } } },
            ]),
            // Ciudades (city): aplica tags + nivel
            User.aggregate([
                { $match: buildUserFilter({ skipCity: true }) },
                { $match: { city: { $exists: true, $ne: '' } } },
                { $group: { _id: '$city', count: { $sum: 1 } } },
            ]),
            // Ciudades (city2): aplica tags + nivel
            User.aggregate([
                { $match: buildUserFilter({ skipCity: true }) },
                { $match: { city2: { $exists: true, $ne: '' } } },
                { $group: { _id: '$city2', count: { $sum: 1 } } },
            ]),
            // Niveles: aplica ciudad + tags
            User.aggregate([
                { $match: buildUserFilter({ skipLevel: true }) },
                { $match: { creativeLevel: { $in: [1,2,3,4] } } },
                { $group: { _id: '$creativeLevel', count: { $sum: 1 } } },
            ]),
            // ProjectTypes: aplica todos los filtros de usuario, cuenta tipos de post
            Post.aggregate([
                { $match: { user: { $in: fullMatchIds }, images: { $exists: true, $ne: [] }, hiddenFromExplorer: { $ne: true } } },
                { $unwind: { path: '$projectTypes', preserveNullAndEmptyArrays: false } },
                { $group: { _id: '$projectTypes', count: { $sum: 1 } } },
            ]),
        ]);

        const cityMap = {};
        for (const c of cityAgg1) cityMap[c._id] = (cityMap[c._id] || 0) + c.count;
        for (const c of cityAgg2) cityMap[c._id] = (cityMap[c._id] || 0) + c.count;

        return res.json({
            tags:         Object.fromEntries(tagAgg.map(c => [c._id, c.count])),
            cities:       cityMap,
            levels:       Object.fromEntries(levelAgg.map(c => [String(c._id), c.count])),
            projectTypes: Object.fromEntries(typeAgg.map(c => [c._id, c.count])),
        });
    } catch (err) {
        console.error('getExplorerFacets error:', err);
        return res.status(500).json({ error: 'Error al calcular facetas del explorer' });
    }
};


exports.getTagPreviews = async (req, res) => {
    try {
        const results = await Post.aggregate([
            { $match: { projectTypes: { $in: EXPLORER_PROJECT_TYPES }, images: { $exists: true, $ne: [] } } },
            { $sample: { size: 2000 } },
            { $unwind: '$projectTypes' },
            { $match: { projectTypes: { $in: EXPLORER_PROJECT_TYPES } } },
            { $group: { _id: '$projectTypes', imgs: { $push: { $arrayElemAt: ['$images', 0] } } } },
            { $project: { imgs: { $slice: ['$imgs', 10] } } },
        ]);

        const previews = {};
        results.forEach(r => { if (r.imgs?.length) previews[r._id] = r.imgs; });

        res.json({ previews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getExplorerPostTags = async (req, res) => {
    try {
        const result = await Post.aggregate([
            { $match: { images: { $exists: true, $ne: [] }, tags: { $exists: true, $ne: [] } } },
            { $unwind: '$tags' },
            { $match: { tags: { $ne: '' } } },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 60 },
        ]);
        const tags = result.map(r => ({ tag: r._id, count: r.count }));
        res.status(200).json({ tags });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    images: { type: [String], required: true },
    thumbUrls: { type: [String], default: [] },
    mainImage: { type: String, required: true },
    tags: [{ type: String }],
    peopleTags: [
      {
        name: { type: String, default: "" },
        username: { type: String, default: "" },        // ✅ para usuarios registrados
        role: { type: String, default: "" },
        socialUrl: { type: String, default: "" },       // ✅ para externos
        instagram: { type: String, default: "" },       // ✅ handle de instagram (sin @)
        isRegistered: { type: Boolean, default: false },// ✅ para diferenciar
        avatar: { type: String, default: "" },          // ✅ opcional, ayuda a render rápido
      }
    ],
    publishedIn: [
      {
        mediaName:  { type: String, default: "" },
        articleUrl: { type: String, default: "" },
        isOnline:   { type: Boolean, default: false },
        isPrinted:  { type: Boolean, default: false },
      }
    ],
    projectTypes: { type: [String], default: [] },
    imageTags: { type: Map, of: String, default: {} },
    authorRole: { type: String, default: '' },
    staffPick: { type: Boolean, default: false },
    hiddenFromExplorer: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    // Orden manual del dueño en "Todos los proyectos" / galería del Portfolio
    // (drag & drop en /proyectos/organizar). null = sin ordenar a mano todavía
    // — el sort secundario por createdAt desc mantiene el orden de siempre.
    portfolioOrder: { type: Number, default: null },
});

module.exports = mongoose.model('Post', PostSchema);
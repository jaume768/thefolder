const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    images: { type: [String], required: true },
    mainImage: { type: String, required: true },
    tags: [{ type: String }],
    peopleTags: [
      {
        name: { type: String, default: "" },
        username: { type: String, default: "" },        // ✅ para usuarios registrados
        role: { type: String, default: "" },
        socialUrl: { type: String, default: "" },       // ✅ para externos
        isRegistered: { type: Boolean, default: false },// ✅ para diferenciar
        avatar: { type: String, default: "" },          // ✅ opcional, ayuda a render rápido
      }
    ],
    imageTags: { type: Map, of: [String], default: {} },
    staffPick: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
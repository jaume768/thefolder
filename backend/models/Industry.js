const mongoose = require('mongoose');

const IndustrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    link: { type: String, default: '', trim: true },
    image: { type: String, required: true }, // URL final
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Industry', IndustrySchema);
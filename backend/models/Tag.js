const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // slug estable
    type: { type: String, required: true },             // "role"
    label: { type: String, required: true },            // texto visible
    status: { type: String, default: "active" },
    group: { type: String, required: true },            // macro bloque
    order: { type: Number, default: 0 }                 // orden interno
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", TagSchema);
// models/TagSuggestion.js
import mongoose from "mongoose";

const TagSuggestionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, required: true }, // role / specialty
    label: { type: String, required: true },
    note: { type: String, default: "" },
    status: { type: String, default: "pending" }, // pending/approved/rejected
  },
  { timestamps: true }
);

export default mongoose.model("TagSuggestion", TagSuggestionSchema);
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  postImage: { type: String, default: '' },
  reason: { type: String, required: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);

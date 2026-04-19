const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  avatarUrl: { type: String }, // Random avatar if not provided
  movieId: { type: String, required: true },
  movieTitle: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  userRole: { type: String, enum: ['user', 'critic'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);

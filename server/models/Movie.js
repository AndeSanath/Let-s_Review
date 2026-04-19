const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true, sparse: true },
  title: { type: String, required: true },
  posterUrl: { type: String },
  bannerUrl: { type: String },
  synopsis: { type: String },
  rating: { type: Number, default: 0 },
  category: { type: String, enum: ['Theatre', 'OTT', 'Trending', 'New'], default: 'Trending' },
  platform: { type: String }, // e.g., Netflix, Prime
  genre: { type: String },
  language: { type: String },
  releaseYear: { type: Number },
  reviewsCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Movie', MovieSchema);

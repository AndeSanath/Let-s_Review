# 🎬 Lets Review

Lets Review is a premium, responsive web application built for the modern movie enthusiast. It seamlessly merges a vibrant community review platform with the live TMDB (The Movie Database) API, now enhanced with a Machine Learning-powered recommendation engine to deliver a truly personalized cinematic experience.

Whether you are hunting for blockbusters, maintaining a personal watchlist, or looking for your next "Critic Soulmate," Lets Review provides a state-of-the-art, glassmorphism-inspired interface to do it all.

✨ Features
🤖 ML-Powered Recommendations: Features a custom Cosine Similarity engine that analyzes your "Watched" and "Liked" history to suggest new movies with a percentage-based match score.
👥 Intelligent Critic Matching: Automatically suggests critics based on shared cinematic taste—finding reviewers who gave high ratings to the same movies you loved.
🍿 Live TMDB Integration: Fetches real-time data for "Trending", "New Releases", "In Theatres", and "OTT Platforms" directly from the TMDB API.
🔍 Global Movie Search: Instantly search the entire global movie database with detailed pages including synopses, cast info, and high-definition trailers.
📝 Community & Critic Reviews: Write reviews, give star ratings, and view separated tabs for standard audience feedback vs. verified professional critic reviews.
🎨 Premium Aesthetics: A sleek, interactive UI featuring Glassmorphism, dynamic background overlays, and a curated Dark/Light mode system.
🔐 Secure Authentication: JWT-based secure login system with protected user profiles and encrypted data handling.
🛠️ Tech Stack
Frontend: React.js, Vite, React Router, CSS3 (Glassmorphism & Variables), Lucide React (Icons).
Backend: Node.js, Express.js.
AI/ML Logic: Content-Based Filtering using the Vector Space Model and Cosine Similarity algorithms.
Database: MongoDB & Mongoose.
External APIs: TMDB (The Movie Database) API.
🚀 Getting Started
Prerequisites
Node.js installed on your system.
MongoDB running locally (mongodb://127.0.0.1:27017).
A free API Key from TMDB.
Installation
Clone the repository

bash
git clone https://github.com/yourusername/LetsReview.git
cd LetsReview
Setup the Backend

Navigate to /server and run npm install.
Create a .env file and add:
env
PORT=5001
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
(Optional) Run node seedData.js and node seedCritics.js to populate initial data.
Start with npm run dev.
Setup the Frontend

Navigate to /client and run npm install.
Start with npm run dev.
🍿 Enjoy the Cinema!
Open http://localhost:5173 in your browser. Log in, rate a few movies, and head to the "For You" dashboard to see the ML model in action!

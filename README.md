# 🎬 Lets Review

Lets Review is a premium, responsive web application built for modern movie enthusiasts.  
It combines a vibrant community review platform with live TMDB API data and a Machine Learning-powered recommendation engine to deliver a personalized cinematic experience.

Whether you're hunting for blockbusters, managing a watchlist, or finding your "Critic Soulmate", Lets Review offers a sleek, glassmorphism-inspired interface to do it all.

---

## ✨ Features

### 🤖 ML-Powered Recommendations
- Uses Cosine Similarity to analyze your watched & liked history  
- Suggests movies with percentage-based match scores

### 👥 Intelligent Critic Matching
- Finds critics with similar taste  
- Matches based on movies you rated highly

### 🍿 Live TMDB Integration
- Real-time data:
  - Trending  
  - New Releases  
  - In Theatres  
  - OTT Platforms  

### 🔍 Global Movie Search
- Search across the entire movie database  
- View:
  - Synopsis  
  - Cast  
  - HD trailers  

### 📝 Community & Critic Reviews
- Write reviews & give ratings  
- Separate tabs for:
  - Audience reviews  
  - Verified critic reviews  

### 🎨 Premium UI
- Glassmorphism design  
- Dynamic backgrounds  
- Dark/Light mode  

### 🔐 Secure Authentication
- JWT-based login  
- Protected user profiles  
- Encrypted data handling  

---

## 🛠️ Tech Stack

Frontend
- React.js  
- Vite  
- React Router  
- CSS3 (Glassmorphism)  
- Lucide React  

Backend
- Node.js  
- Express.js  

AI/ML
- Content-Based Filtering  
- Vector Space Model  
- Cosine Similarity  

Database
- MongoDB  
- Mongoose  

External API
- TMDB API  

---

## 🚀 Getting Started

### 🔧 Prerequisites
- Node.js installed  
- MongoDB running locally (mongodb://127.0.0.1:27017)  
- TMDB API Key  

---

### 📥 Installation

#### 1. Clone Repository
bash git clone https://github.com/yourusername/LetsReview.git cd LetsReview 

---

### ⚙️ Backend Setup

bash cd server npm install 

Create .env file:

env PORT=5001 TMDB_API_KEY=your_tmdb_api_key TMDB_BASE_URL=https://api.themoviedb.org/3 TMDB_IMAGE_BASE=https://image.tmdb.org/t/p 

(Optional seed data)
bash node seedData.js node seedCritics.js 

Run backend:
bash npm run dev 

---

### 💻 Frontend Setup

bash cd client npm install npm run dev 

---

## 🍿 Run the App

Open in browser:

http://localhost:5173

- Log in  
- Rate movies  
- Go to "For You" dashboard  
- See ML recommendations 🎯  

---

## ⭐ Enjoy the Cinema

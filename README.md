# 🎬 Lets Review

**Lets Review** is a modern, responsive web application designed for movie enthusiasts. It seamlessly merges a vibrant community review platform with the live **TMDB (The Movie Database)** API to deliver up-to-the-minute information on trending movies, new releases, and theater showtimes. 

Whether you want to hunt for upcoming blockbusters, maintain a personal watchlist, or duke it out in the reviews section, Lets Review provides a premium, glassmorphism-inspired UI to do it all.

![Lets Review Screenshot](https://via.placeholder.com/1000x500.png?text=Add+a+screenshot+of+your+app+here!)

## ✨ Features

* **🍿 Live TMDB Integration:** Automatically fetches real-time data for "Trending", "New Releases", "In Theatres", and "OTT Platforms", completely bypassing the need for manual database updates.
* **🔍 Global Movie Search:** Instantly search for any movie in the world and view detailed pages including synopses, cast info, and YouTube trailers.
* **📝 Community & Critic Reviews:** Write reviews, give star ratings, and view separated tabs for standard audience feedback vs. verified critic reviews.
* **📚 Watchlists & Tracking:** Registered users can manage a personalized watchlist and mark movies as "Watched".
* **🎨 Premium Aesthetics:** Features a sleek dark/light mode toggle with frosted glass (glassmorphism) panels, responsive layouts, and dynamic background overlays based on movie posters.
* **🔐 Secure Authentication:** JWT-based user authentication securely hashes passwords and protects user profiles.

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, React Router, CSS3 (Glassmorphism & CSS Variables for Themeing), Lucide React (Icons).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB & Mongoose.
* **External APIs:** TMDB (The Movie Database) API.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and MongoDB installed on your system. You will also need a free API Key from [TMDB](https://developer.themoviedb.org/docs).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/LetsReview.git
   cd LetsReview
   
2. Setup the Backend
bash
cd server
npm install
Create a .env file in the /server directory and add:
env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_api_key
Optional: Run npm run seed to populate some initial test critics in your DB. Start the backend:
bash
npm run dev

3. Setup the Frontend Open a new terminal and navigate to the client folder:
bash
cd client
npm install
npm run dev

4. Enjoy the Cinema! Open http://localhost:5173 in your browser.

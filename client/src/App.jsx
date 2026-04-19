import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Search from './pages/Search';
import Critics from './pages/Critics';
import Profile from './pages/Profile';
import LiveReviewToast from './components/LiveReviewToast';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/explore" /> : <Landing />} />
      <Route path="/explore" element={<Home />} />
      <Route path="/movie/:id" element={<MovieDetails />} />
      <Route path="/category/:type" element={<Categories />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/search" element={<Search />} />
      <Route path="/critics" element={<Critics />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <AppRoutes />
          </main>
          <LiveReviewToast />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

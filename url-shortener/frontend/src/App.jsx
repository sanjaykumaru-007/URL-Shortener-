import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import PublicStats from './pages/PublicStats';
import RedirectPage from './pages/RedirectPage';   // ✅ IMPORTANT ADD THIS
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>

          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            
            <Navbar />

            <main>
              <Routes>

                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* PUBLIC STATS (optional feature) */}
                <Route path="/s/:shortCode" element={<PublicStats />} />

                {/* 🔥 IMPORTANT: SHORT URL REDIRECT ROUTE */}
                <Route path="/r/:code" element={<RedirectPage />} />

                {/* PRIVATE ROUTES */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/analytics/:id" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* 404 PAGE */}
                <Route path="*" element={<NotFound />} />

              </Routes>
            </main>

            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

          </div>

        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import RoomPage from './pages/RoomPage';
import Admin from './pages/Admin';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',padding:'80px'}}><span className="spinner"></span></div>;
  return user ? children : <Navigate to="/login" />;
}

function AppInner() {
  const { user, loading } = useAuth();
  const [nightMode, setNightMode] = useState(() => localStorage.getItem('nightMode') === 'true');

  useEffect(() => {
    document.body.classList.toggle('night-mode', nightMode);
    localStorage.setItem('nightMode', nightMode);
  }, [nightMode]);

  useEffect(() => {
    const showDef = localStorage.getItem('showDefinition') === 'true';
    document.body.classList.toggle('definition-hidden', !showDef);
  }, []);

  if (loading) return <div style={{textAlign:'center',padding:'80px'}}><span className="spinner"></span></div>;

  const isAuth = ['/login', '/register', '/verify-email', '/forgot-password'];
  const publicPaths = isAuth.some(p => window.location.pathname.startsWith(p));

  return (
    <>
      {user && !publicPaths && <Navbar onNightMode={setNightMode} nightMode={nightMode} />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/room/:id" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}

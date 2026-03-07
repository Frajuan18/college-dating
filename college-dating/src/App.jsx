// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import CoverPage from './components/CoverPage';
import Home from './pages/Home';
import Register from './components/Register';
import AdminLogin from './pages/admin/login';
import AdminDashboard from './pages/admin/AdminDashboard';
import MyProfile from './pages/MyProfile';
import Login from './components/Login';
import Matches from './pages/Matches';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CoverPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
// App.js - Main routing configuration
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CoverPage from './components/CoverPage';
import Register from './components/Register';
import Login from './components/Login';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CoverPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
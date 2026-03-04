import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CoverPage from './components/CoverPage';
import RegisterPage from './components/RegisterPage'; // You'll create this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CoverPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
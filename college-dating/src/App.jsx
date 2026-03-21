// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import ToastNotification from './components/ToastNotification';
import { supabase } from './lib/supabaseClient';
import { messageService } from './services/messageService';

// Main App Content with Toast Logic
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [subscription, setSubscription] = useState(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const telegramId = localStorage.getItem('telegramId');
        if (!telegramId) return;

        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', parseInt(telegramId))
          .single();

        if (!error && userData) {
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Subscribe to new messages when user is logged in
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log('Setting up message subscription for user:', currentUser.id);

    const newSubscription = messageService.subscribeToMessages(currentUser.id, (newMessage) => {
      console.log('New message received:', newMessage);
      
      // Don't show notification if already on messages page
      if (location.pathname === '/messages') return;
      
      // Show toast notification
      setToastMessage(newMessage);
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('New Message', {
          body: `${newMessage.sender?.full_name || 'Someone'} sent: ${newMessage.content.substring(0, 50)}`,
          icon: newMessage.sender?.photo_url || '/default-avatar.png',
        });
      }
    });

    setSubscription(newSubscription);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (newSubscription) {
        newSubscription.unsubscribe();
      }
    };
  }, [currentUser?.id, location.pathname]);

  const handleToastClick = () => {
    if (toastMessage) {
      navigate('/messages', { state: { userId: toastMessage.sender_id } });
      setToastMessage(null);
    }
  };

  return (
    <>
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
      
      {toastMessage && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          onClick={handleToastClick}
        />
      )}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
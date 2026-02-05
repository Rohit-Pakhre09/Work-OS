import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OTPVerification from './pages/auth/OTPVerification';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getProfile } from './features/auth/authSlice';

const Home = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <h1>Welcome</h1>
    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
      <Link to="/login" style={{ padding: '10px 20px', backgroundColor: 'lightblue', textDecoration: 'none', color: 'black' }}>Login</Link>
      <Link to="/signup" style={{ padding: '10px 20px', backgroundColor: 'lightgreen', textDecoration: 'none', color: 'black' }}>Signup</Link>
    </div>
  </div>
);

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;

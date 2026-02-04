import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../features/auth/authSlice';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, error } = useSelector(state => state.auth);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    const otp = params.get('otp');

    dispatch(resetPassword({ email, otp, password: formData.password })).then(action => {
      if (action.type === 'auth/resetPassword/fulfilled') {
        navigate('/login');
      }
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
        <h2>Reset Password</h2>
        {error && <p style={{ color: 'red' }}>{error.message}</p>}
        <input
          type="password"
          name="password"
          placeholder="New Password"
          onChange={handleChange}
          value={formData.password}
          required
          style={{ margin: '10px 0', padding: '10px' }}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          onChange={handleChange}
          value={formData.confirmPassword}
          required
          style={{ margin: '10px 0', padding: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: 'lightblue' }}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;

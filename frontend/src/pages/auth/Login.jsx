import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(login(formData)).then(action => {
      if (action.type === 'auth/login/fulfilled') {
        navigate('/dashboard');
      }
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col w-80 p-10 bg-neutral-50 shadow rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-4">{error.message}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
          required
          className="mb-2.5 p-2.5 border border-gray-300 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
          required
          className="mb-2.5 p-2.5 border border-gray-300 rounded"
        />
        <button type="submit" disabled={loading} className="p-2.5 bg-blue-300 rounded hover:bg-blue-400 disabled:bg-gray-300">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-center mt-2.5">
          Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
        </p>
        <p className="text-center mt-2.5">
          <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
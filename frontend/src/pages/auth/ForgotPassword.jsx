import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../features/auth/authSlice';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(forgotPassword(email)).then(action => {
      if (action.type === 'auth/forgotPassword/fulfilled') {
        navigate(`/otp-verification?email=${email}`);
      }
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col w-80 p-10 bg-neutral-50 shadow rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <p className="mb-4">Enter your email to receive a password reset link.</p>
        {error && <p className="text-red-500 mb-4">{error.message}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          value={email}
          required
          className="mb-2.5 p-2.5 border border-gray-300 rounded"
        />
        <button type="submit" disabled={loading} className="p-2.5 bg-blue-300 rounded hover:bg-blue-400 disabled:bg-gray-300">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <p className="text-center mt-2.5">
          Remember your password? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
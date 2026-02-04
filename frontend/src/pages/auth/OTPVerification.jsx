import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp } from '../../features/auth/authSlice';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = user?.email;
    dispatch(verifyOtp({ email, otp })).then(action => {
      if (action.type === 'auth/verifyOtp/fulfilled') {
        navigate(`/reset-password?email=${email}&otp=${otp}`);
      }
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col w-80 p-10 bg-neutral-50 shadow rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">OTP Verification</h2>
        <p className="mb-4">Enter the OTP sent to your email.</p>
        {error && <p className="text-red-500 mb-4">{error.message}</p>}
        <input
          type="text"
          name="otp"
          placeholder="OTP"
          onChange={e => setOtp(e.target.value)}
          value={otp}
          required
          className="mb-2.5 p-2.5 border border-gray-300 rounded"
        />
        <button type="submit" disabled={loading} className="p-2.5 bg-blue-300 rounded hover:bg-blue-400 disabled:bg-gray-300">
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;

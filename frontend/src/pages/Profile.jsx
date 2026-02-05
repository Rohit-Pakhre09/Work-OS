import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, loading, error } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        jobTitle: user?.jobTitle || '',
        department: user?.department || '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        if (!user) return;
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.jobTitle || '',
            department: user.department || '',
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await dispatch(updateProfile(formData)).unwrap();
            setIsEditing(false);
        } catch (err) {
            console.log(err);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-md p-10 bg-neutral-50 shadow rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <p className="mt-1 p-2 bg-gray-100 rounded">{user?.employeeId || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="mt-1 p-2 w-full border rounded"
                            />
                        ) : (
                            <p className="mt-1 p-2 bg-gray-100 rounded">{user?.firstName || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="mt-1 p-2 w-full border rounded"
                            />
                        ) : (
                            <p className="mt-1 p-2 bg-gray-100 rounded">{user?.lastName || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="mt-1 p-2 w-full border rounded"
                            />
                        ) : (
                            <p className="mt-1 p-2 bg-gray-100 rounded">{user?.email || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                className="mt-1 p-2 w-full border rounded"
                            />
                        ) : (
                            <p className="mt-1 p-2 bg-gray-100 rounded">{user?.jobTitle || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="mt-1 p-2 w-full border rounded"
                            />
                        ) : (
                            <p className="mt-1 p-2 bg-gray-100 rounded">{user?.department || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                        <p className="mt-1 p-2 bg-gray-100 rounded">{user?.employmentStatus || 'N/A'}</p>
                    </div>
                </div>
                <div className="mt-6 space-y-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full p-2.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="w-full p-2.5 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="w-full p-2.5 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Edit Profile
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full p-2.5 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;

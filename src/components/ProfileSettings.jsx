import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ProfileSettings({ user, onClose, onUpdate }) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валидация
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError('Please enter current password to change password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/users/v1/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          currentPassword: formData.currentPassword || null,
          newPassword: formData.newPassword || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Обновляем localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      
      // Вызываем callback для обновления UI
      if (onUpdate) {
        onUpdate(updatedUser);
      }

      // Очищаем поля паролей
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Закрываем модальное окно через 2 секунды
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${theme.isDark ? theme.cardBg : 'bg-white'} rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className={`${theme.isDark ? theme.hoverBg : 'hover:bg-gray-100'} rounded-lg p-2 transition`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className={`block text-sm font-medium ${theme.isDark ? theme.textPrimary : 'text-gray-700'} mb-2`}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${theme.isDark ? `${theme.cardBg} ${theme.borderColor} ${theme.textPrimary}` : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium ${theme.isDark ? theme.textPrimary : 'text-gray-700'} mb-2`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${theme.isDark ? `${theme.cardBg} ${theme.borderColor} ${theme.textPrimary}` : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            />
          </div>

          {/* Divider */}
          <div className={`border-t ${theme.isDark ? theme.borderColor : 'border-gray-200'} pt-4 mt-6`}>
            <p className={`text-sm ${theme.isDark ? theme.textSecondary : 'text-gray-500'} mb-3`}>
              Leave password fields empty if you don't want to change password
            </p>
          </div>

          {/* Current Password */}
          <div>
            <label className={`block text-sm font-medium ${theme.isDark ? theme.textPrimary : 'text-gray-700'} mb-2`}>
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${theme.isDark ? `${theme.cardBg} ${theme.borderColor} ${theme.textPrimary}` : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter current password to change"
            />
          </div>

          {/* New Password */}
          <div>
            <label className={`block text-sm font-medium ${theme.isDark ? theme.textPrimary : 'text-gray-700'} mb-2`}>
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${theme.isDark ? `${theme.cardBg} ${theme.borderColor} ${theme.textPrimary}` : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter new password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block text-sm font-medium ${theme.isDark ? theme.textPrimary : 'text-gray-700'} mb-2`}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${theme.isDark ? `${theme.cardBg} ${theme.borderColor} ${theme.textPrimary}` : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Confirm new password"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 border ${theme.isDark ? `${theme.borderColor} ${theme.textSecondary}` : 'border-gray-300 text-gray-700'} rounded-lg hover:bg-gray-100 transition`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-gradient-to-r ${theme.primary} text-white rounded-lg hover:shadow-lg transition disabled:opacity-50`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

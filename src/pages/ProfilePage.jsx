import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState({ username: 'User', email: 'no-email' });

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskHub
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <span className="text-gray-700 font-medium">My Profile</span>
              <button
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-gray-600 text-lg mb-6">{user.email}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

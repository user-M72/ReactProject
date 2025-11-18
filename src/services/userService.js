const API_BASE_URL = 'http://localhost:8080/api/users/v1';

export const userService = {
  // Регистрация
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};
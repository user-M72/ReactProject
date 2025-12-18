import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../api/userService'; // твой сервис API

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    phoneNumber: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Вызов API регистрации
      const result = await userService.register(formData);

      console.log('Registration successful:', result);
      setSuccess(true);

      // Через 1-2 секунды переходим на профиль с передачей данных
      setTimeout(() => {
        navigate('/profile', { state: { 
          username: result.username, 
          email: result.email 
        }});
      }, 1000);

    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... твоя форма остаётся без изменений
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ... весь JSX формы как в твоём коде */}
      </div>
    </div>
  );
};

export default RegisterForm;

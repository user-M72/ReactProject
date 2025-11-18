import React, { useState } from 'react';
import { userService } from '../services/userService';

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await userService.register(formData);
      console.log('Registration successful:', result);
      setSuccess(true);
      // Очистить форму
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        phoneNumber: '',
        email: ''
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '50px auto', 
      padding: '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>User Registration</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose username"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+998 XX XXX XX XX"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
            minLength="6"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ 
            color: 'white',
            backgroundColor: '#dc3545',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            color: 'white',
            backgroundColor: '#28a745',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            Registration successful!
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#007bff')}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
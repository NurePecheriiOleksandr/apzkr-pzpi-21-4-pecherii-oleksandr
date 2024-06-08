import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { fetchCsrfToken } from '../../api/csrf';
import styles from './Login.module.css';
import { useUser } from '../Shared/UserContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useUser();

    useEffect(() => {
        const setCsrfToken = async () => {
            await fetchCsrfToken();
        };
        setCsrfToken();
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await axiosInstance.post('/api/login/', { email, password });
          console.log('Login response:', response); 
          if (response.status === 200 && response.data.user) {
              const { email, role } = response.data.user;
              login({ email, role });
              navigate('/');
          } else {
              setError('Invalid email or password');
          }
      } catch (err) {
          console.error('Login error:', err.response ? err.response.data : err.message);
          setError('Invalid email or password');
      }
    };

    return (
        <div className={styles.loginContainer}>
            <h1 className={styles.title}>DeepDive</h1>
            <h2 className={styles.heading}>Login</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className={styles.buttonContainer}>
                    <button type="submit">Login</button>
                </div>
            </form>
            <p className={styles.link}>Don't have an account? <a href="/register">Register here</a></p>
        </div>
    );
};

export default Login;
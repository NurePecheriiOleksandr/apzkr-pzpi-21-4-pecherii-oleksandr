import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { fetchCsrfToken } from '../../api/csrf';
import styles from './Login.module.css';
import { useUser } from '../Shared/UserContext';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [height, setHeight] = useState('');
    const [footSize, setFootSize] = useState('');
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
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            const response = await axiosInstance.post('/api/register/', {
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                height,
                foot_size: footSize
            });
            console.log('Register response:', response);  
            if (response.status === 201 && response.data) {
                login({ email: response.data.email, role: response.data.role });
                navigate('/');
            } else {
                setError('Registration failed');
            }
        } catch (err) {
            console.error('Register error:', err.response ? err.response.data : err.message);
            setError('Registration failed');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <h2 className={styles.heading}>Register</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="first-name">First Name:</label>
                    <input
                        type="text"
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="last-name">Last Name:</label>
                    <input
                        type="text"
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="height">Height (cm):</label>
                    <input
                        type="number"
                        id="height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="foot-size">Foot Size (cm):</label>
                    <input
                        type="number"
                        id="foot-size"
                        value={footSize}
                        onChange={(e) => setFootSize(e.target.value)}
                    />
                </div>
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
                <div className={styles.formGroup}>
                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className={styles.buttonContainer}>
                    <button type="submit">Register</button>
                </div>
            </form>
            <p className={styles.link}>Already have an account? <a href="/login">Login here</a></p>
        </div>
    );
};

export default Register;
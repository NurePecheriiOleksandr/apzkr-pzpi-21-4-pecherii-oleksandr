import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import axiosInstance from '../../api/axiosInstance'; 
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useUser(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/logout/'); 
      logout(); 
      navigate('/login'); 
    } catch (error) {
      console.error('Logout error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarLeft}>
        <li className={styles.navbarItem}>
          <Link to="/" className={styles.navbarLink}>Activities</Link>
        </li>
        <li className={styles.navbarItem}>
          <Link to="/organizers" className={styles.navbarLink}>Organizers</Link>
        </li>
        {user && user.role !== 'user' && (
          <li className={styles.navbarItem}>
            <Link to="/gears" className={styles.navbarLink}>Gear</Link>
          </li>
        )}
        {user && user.role === 'admin' && (
          <li className={styles.navbarItem}>
            <Link to="/admin" className={styles.navbarLink}>Administration</Link>
          </li>
        )}
      </ul>
      <ul className={styles.navbarRight}>
        {user ? (
          <>
            <li className={styles.navbarItem}>
              <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </li>
            <li className={styles.navbarItem}>{user.email}</li>
          </>
        ) : (
          <li className={styles.navbarItem}>
            <Link to="/login" className={styles.navbarLink}>Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useUser } from '../Shared/UserContext';
import styles from './AdminPage.module.css';

const AdminPage = () => {
    const [diveComputers, setDiveComputers] = useState([]);
    const { user } = useUser();
    const [password, setPassword] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchDiveComputers();
        }
    }, [user]);

    const fetchDiveComputers = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/dive_computers/');
            setDiveComputers(response.data);
        } catch (error) {
            console.error('Failed to fetch dive computers', error);
        }
    };

    const handleAddDiveComputer = async () => {
        try {
            const response = await axiosInstance.post('/api/admin/dive_computers/');
            setDiveComputers([...diveComputers, response.data]);
        } catch (error) {
            console.error('Failed to add dive computer', error);
        }
    };

    const handleDeleteDiveComputer = async (id) => {
        try {
            await axiosInstance.delete(`/api/admin/dive_computers/${id}/`);
            setDiveComputers(diveComputers.filter(dc => dc.id !== id));
        } catch (error) {
            console.error('Failed to delete dive computer', error);
        }
    };

    const handleBackupDatabase = async () => {
        try {
            await axiosInstance.post('/api/admin/backup/', { password });
            alert('Backup successful.');
        } catch (error) {
            console.error('Failed to backup database', error);
            alert('Backup failed.');
        }
    };

    return (
        <div className={styles.adminPageContainer}>
            <h1>Admin Page</h1>
            <h2>Dive Computers</h2>
            <ul className={styles.diveComputerList}>
                {diveComputers.map(dc => (
                    <li key={dc.id} className={styles.diveComputerItem}>
                        <span>Serial Number: {dc.id}</span>
                        <button onClick={() => handleDeleteDiveComputer(dc.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <div className={styles.buttonGroup}>
                <button onClick={handleAddDiveComputer}>Add Dive Computer</button>
                <button onClick={() => setShowPasswordField(true)}>Backup Database</button>
            </div>
            {showPasswordField && (
                <div className={styles.passwordField}>
                    <input
                        type="password"
                        placeholder="Enter PostgreSQL password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleBackupDatabase}>Submit</button>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
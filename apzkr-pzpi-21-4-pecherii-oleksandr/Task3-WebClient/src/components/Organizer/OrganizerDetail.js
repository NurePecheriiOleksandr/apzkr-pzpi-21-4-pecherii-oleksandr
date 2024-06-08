import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useUser } from '../Shared/UserContext';
import styles from './OrganizerDetail.module.css';

function OrganizerDetail() {
    const { id } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [organizer, setOrganizer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get(`http://localhost:8000/api/organizers/${id}/`)
            .then(response => {
                console.log('Organizer response:', response.data);
                setOrganizer(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!organizer) {
        return <div>Organizer not found</div>;
    }

    const handleEdit = () => {
        navigate(`/organizers/edit/${id}`);
    };

    const handleAddGear = () => {
        navigate(`/organizers/${id}/add-gear`);
    };

    const handleAddActivity = () => {
        navigate(`/organizers/${id}/activities/create`);
    };

    return (
        <div className={styles.organizerDetailContainer}>
            <h1>{organizer.organizer_name}</h1>
            <p>Type: {organizer.organizer_type}</p>
            <h2>Activities</h2>
            <ul className={styles.activityList}>
                {organizer.activities.map(activity => (
                    <li key={activity.id} className={styles.activityItem}>
                        <div className={styles.activityInfo}>
                            <strong>{activity.activity_name}</strong>
                            <p>Country: {activity.country}</p>
                            <p>Date: {new Date(activity.activity_date_time).toLocaleString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
            {user && (user.role === 'org' || user.role === 'admin') && (
                <div className={styles.buttonContainer}>
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={handleAddGear}>Add Gear</button>
                    <button onClick={handleAddActivity}>Add Activity</button>
                </div>
            )}
        </div>
    );
}

export default OrganizerDetail;
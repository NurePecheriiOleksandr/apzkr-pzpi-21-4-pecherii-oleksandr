import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from '../Shared/Form.module.css';

const ActivityForm = () => {
    const { id, organizerId } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState({
        activity_name: '',
        country: '',
        description: '',
        places: '',
        activity_date_time: '',
        organizer: organizerId,  
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            const fetchActivity = async () => {
                try {
                    const response = await axiosInstance.get(`/api/activities/${id}/`);
                    setActivity(response.data);
                } catch (error) {
                    console.error('Failed to fetch activity', error);
                }
            };

            fetchActivity();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setActivity((prevActivity) => ({
            ...prevActivity,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axiosInstance.put(`/api/activities/${id}/`, activity);
            } else {
                await axiosInstance.post('/api/activities/', { ...activity, organizer: organizerId });
            }
            if (organizerId) {
                navigate(`/organizers/${organizerId}/details`);  
            } else {
                navigate('/'); 
            }
        } catch (error) {
            console.error('Failed to save activity', error);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h1>{isEditing ? 'Edit Activity' : 'Create Activity'}</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Activity Name:</label>
                    <input type="text" name="activity_name" value={activity.activity_name} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Country:</label>
                    <input type="text" name="country" value={activity.country} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Description:</label>
                    <textarea name="description" value={activity.description} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Places:</label>
                    <input type="number" name="places" value={activity.places} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Date and Time:</label>
                    <input type="datetime-local" name="activity_date_time" value={activity.activity_date_time} onChange={handleChange} required />
                </div>
                <button type="submit" className={styles.button}>{isEditing ? 'Update' : 'Create'}</button>
            </form>
        </div>
    );
};

export default ActivityForm;
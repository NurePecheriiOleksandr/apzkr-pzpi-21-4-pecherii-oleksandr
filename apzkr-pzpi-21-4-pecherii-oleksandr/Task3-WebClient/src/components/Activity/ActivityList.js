import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import styles from './ActivityList.module.css';


const ActivityList = () => {
    const [activities, setActivities] = useState([]);
    const [date, setDate] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await axiosInstance.get('/api/activities/');
                console.log('Response data:', response.data); 
                setActivities(response.data); 
            } catch (error) {
                console.error('Failed to fetch activities', error);
            }
        };

        fetchActivities();
    }, []);

    const activitiesByDate = activities.reduce((acc, activity) => {
        const dateKey = new Date(activity.activity_date_time).toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(activity);
        return acc;
    }, {});

    const handleActivityClick = (activityId) => {
        navigate(`/activities/${activityId}`);
    };

    const renderActivities = (date) => {
        const dateKey = date.toDateString();
        return (
            <div className={styles.tileContent}>
                {activitiesByDate[dateKey] ? activitiesByDate[dateKey].map(activity => (
                    <div
                        key={activity.id}
                        className={styles.activityItem}
                        onClick={() => handleActivityClick(activity.id)}
                    >
                        {activity.activity_name}
                        <div className={styles.activityDetails}>
                            {activity.activity_name} - {new Date(activity.activity_date_time).toLocaleTimeString()} - {activity.country}
                        </div>
                    </div>
                )) : <div className={styles.activityItem}>No activities</div>}
            </div>
        );
    };

    return (
        <div className={styles.activityListContainer}>
            <h1>Activities</h1>
            <Calendar
                onChange={setDate}
                value={date}
                className={styles.calendar}
                tileContent={({ date, view }) => view === 'month' && renderActivities(date)}
            />
        </div>
    );
};

export default ActivityList;
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useUser } from '../Shared/UserContext';
import styles from './ActivityDetail.module.css';

const ActivityDetail = () => {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);
    const [isOrgOrAdmin, setIsOrgOrAdmin] = useState(false);
    const [diveComputers, setDiveComputers] = useState([]);
    const { user } = useUser();
    const [depthMetric, setDepthMetric] = useState('meters');
    const [timeMetric, setTimeMetric] = useState('minutes');

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await axiosInstance.get(`/api/activities/${id}/`);
                console.log('Fetched activity:', response.data);
                setActivity(response.data);
            } catch (error) {
                console.error('Failed to fetch activity', error);
            }
        };

        const fetchCurrentUser = async () => {
            try {
                const response = await axiosInstance.get('/api/current_user/');
                const user = response.data;
                console.log('Current user:', user);
                setIsOrgOrAdmin(user.role === 'org' || user.role === 'admin');
            } catch (error) {
                console.error('Failed to fetch current user', error);
            }
        };

        const fetchDiveComputers = async () => {
            try {
                const response = await axiosInstance.get('/api/dive_computers/');
                console.log('Fetched dive computers:', response.data);
                setDiveComputers(response.data);
            } catch (error) {
                console.error('Failed to fetch dive computers', error);
            }
        };

        fetchActivity();
        fetchCurrentUser();
        fetchDiveComputers();
    }, [id]);

    const handleParticipate = async () => {
        try {
            await axiosInstance.post(`/api/activities/${id}/participate/`);
            const response = await axiosInstance.get(`/api/activities/${id}/`);
            setActivity(response.data);
        } catch (error) {
            console.error('Failed to participate', error);
        }
    };

    const handleDiveComputerChange = async (participationId, diveComputerId) => {
        console.log('Updating participation:', participationId, 'with dive computer:', diveComputerId);
        try {
            await axiosInstance.put(`/api/participations/${participationId}/`, { dive_computer: diveComputerId || null });
            const response = await axiosInstance.get(`/api/activities/${id}/`);
            console.log('Updated activity after dive computer change:', response.data);
            setActivity(response.data);
        } catch (error) {
            console.error('Failed to update dive computer', error);
        }
    };

    const handleDistributeGear = async () => {
        try {
            const response = await axiosInstance.post(`/api/activities/${id}/distribute_gear/`);
            console.log('Gear distribution response:', response.data);
            const updatedActivity = await axiosInstance.get(`/api/activities/${id}/`);
            setActivity(updatedActivity.data);
        } catch (error) {
            console.error('Failed to distribute gear', error);
        }
    };

    const handleFreeGear = async () => {
        try {
            const response = await axiosInstance.post(`/api/activities/${id}/free_gear/`);
            console.log('Free gear response:', response.data);
            const updatedActivity = await axiosInstance.get(`/api/activities/${id}/`);
            setActivity(updatedActivity.data);
        } catch (error) {
            console.error('Failed to free gear', error);
        }
    };

    const convertDepthToFeet = (meters) => {
        return (meters * 3.28084).toFixed(2); // 1 meter = 3.28084 feet
    };

    const convertTimeToHoursMinutes = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    const handleDepthMetricChange = (e) => {
        setDepthMetric(e.target.value);
    };

    const handleTimeMetricChange = (e) => {
        setTimeMetric(e.target.value);
    };

    if (!activity) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.activityDetailContainer}>
            <h1>{activity.activity_name}</h1>
            <div className={styles.activityDetails}>
                <p><strong>Date:</strong> {new Date(activity.activity_date_time).toLocaleString()}</p>
                <p><strong>Country:</strong> {activity.country}</p>
                <p><strong>Description:</strong> {activity.description}</p>
                <p><strong>Organizer:</strong> {activity.organizer_name}</p>
            </div>
            
            <h2>Participations</h2>
            {user.role === 'user' ? (
                <ul>
                    {activity.participations.map(participation => (
                        <li key={participation.id}>
                            {participation.user.first_name} {participation.user.last_name}
                        </li>
                    ))}
                </ul>
            ) : (
                <div>
                    {isOrgOrAdmin && (
                        <div className={styles.metricSelectors}>
                            <label>
                                Depth:
                                <select value={depthMetric} onChange={handleDepthMetricChange}>
                                    <option value="meters">Meters</option>
                                    <option value="feet">Feet</option>
                                </select>
                            </label>
                            <label>
                                Dive Time:
                                <select value={timeMetric} onChange={handleTimeMetricChange}>
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                </select>
                            </label>
                        </div>
                    )}
                    <table className={styles.participationTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Gear</th>
                                <th>Dive Computer</th>
                                <th>Assign Dive Computer</th>
                                <th>Set Gear to Null</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.participations.map(participation => (
                                <tr key={participation.id}>
                                    <td>{participation.user.first_name} {participation.user.last_name}</td>
                                    <td>{participation.gear ? participation.gear.gear_name : 'No gear assigned'}</td>
                                    <td>
                                        {participation.dive_computer ? (
                                            <>
                                                Depth: {depthMetric === 'meters' ? participation.dive_computer.depth : convertDepthToFeet(participation.dive_computer.depth)} {depthMetric === 'meters' ? 'm' : 'ft'}, 
                                                Dive Time: {timeMetric === 'minutes' ? participation.dive_computer.dive_time : convertTimeToHoursMinutes(participation.dive_computer.dive_time)} {timeMetric === 'minutes' ? 'min' : ''}
                                            </>
                                        ) : (
                                            'No dive computer assigned'
                                        )}
                                    </td>
                                    <td>
                                        <select
                                            value={participation.dive_computer ? participation.dive_computer.id : ''}
                                            onChange={(e) => handleDiveComputerChange(participation.id, e.target.value)}
                                        >
                                            <option value="">Select Dive Computer</option>
                                            {diveComputers.map(dc => (
                                                <option key={dc.id} value={dc.id}>
                                                    {dc.id}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDiveComputerChange(participation.id, null)}>Set Gear to Null</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={styles.buttonGroup}>
                {isOrgOrAdmin && (
                    <>
                        <Link to={`/activities/edit/${id}`}><button>Upgrade</button></Link>
                        <button onClick={handleDistributeGear}>Distribute Gear</button>
                        <button onClick={handleFreeGear}>Free Gear</button>
                    </>
                )}
                <button onClick={handleParticipate}>Participate</button>
            </div>
        </div>
    );
};

export default ActivityDetail;
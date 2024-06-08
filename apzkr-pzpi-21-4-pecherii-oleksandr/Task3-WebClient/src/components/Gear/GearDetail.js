import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useUser } from '../Shared/UserContext';
import styles from './GearDetail.module.css';

function GearDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [gear, setGear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axiosInstance.get(`http://localhost:8000/api/gears/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log('Gear response:', response.data);
        setGear(response.data);
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

  if (!gear) {
    return <div>Gear not found</div>;
  }

  const handleEdit = () => {
    navigate(`/gears/edit/${id}`);
  };

  return (
    <div className={styles.gearDetailContainer}>
      <h1>{gear.gear_name}</h1>
      <p>Type: {gear.gear_type}</p>
      <p>Size: {gear.size}</p>
      <p>Reserved: {gear.is_reserved ? 'Yes' : 'No'}</p>
      {gear.gear_type === 'Wetsuit' && gear.wetsuit_size && (
        <p>Wetsuit Size: {gear.wetsuit_size.size}</p>
      )}
      {gear.organizer && (
        <p>Organizer Name: {gear.organizer.organizer_name || 'Unknown Organizer'}</p>
      )}
      {user && (user.role === 'org' || user.role === 'admin') && (
        <button onClick={handleEdit}>Edit</button>
      )}
    </div>
  );
}

export default GearDetail;
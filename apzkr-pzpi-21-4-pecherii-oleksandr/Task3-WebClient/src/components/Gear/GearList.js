import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Shared/UserContext';
import axiosInstance from '../../api/axiosInstance';  
import styles from './GearList.module.css';

function GearList() {
  const { user } = useUser();  
  const [gears, setGears] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('User context in useEffect:', user); 
    if (user) {
      console.log('User is available:', user);  

      axiosInstance.get('/api/gears/')
        .then(response => {
          setGears(response.data);
          console.log('Gears:', response.data);  
        })
        .catch(error => console.error('Fetch error:', error));
    } else {
      console.log('User is not available');  
    }
  }, [user]);

  const handleButtonClick = (gearId) => {
    navigate(`/gears/${gearId}/details`);
  };

  
  const gearsByOrganizer = gears.reduce((acc, gear) => {
    const organizerName = gear.organizer?.organizer_name || 'Unknown Organizer';
    if (!acc[organizerName]) {
      acc[organizerName] = [];
    }
    acc[organizerName].push(gear);
    return acc;
  }, {});

  return (
    <div className={styles.gearListContainer}>
      <h1>GEARS</h1>
      {Object.keys(gearsByOrganizer).map(organizerName => (
        <div key={organizerName} className={styles.organizerContainer}>
          <h2>{organizerName}</h2> 
          <ul className={styles.gearList}>
            {gearsByOrganizer[organizerName].map(gear => (
              <li key={gear.id} className={styles.gearItem}>
                {gear.gear_name} {gear.gear_type}
                <button onClick={() => handleButtonClick(gear.id)}>Details</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default GearList;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Shared/UserContext';
import styles from './OrganizerList.module.css';

function OrganizerList() {
  const { user } = useUser();  
  const [organizers, setOrganizers] = useState([]);
  const [userOrganizers, setUserOrganizers] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/organizers/')
      .then(response => {
        setOrganizers(response.data);
        console.log('Organizers:', response.data);  
      })
      .catch(error => console.error('Fetch error:', error));

    if (user && user.id) {
      axios.get(`http://localhost:8000/api/user_organizers/${user.id}/`)
        .then(response => {
          setUserOrganizers(response.data);
          console.log('UserOrganizers:', response.data); 
        })
        .catch(error => console.error('Fetch error:', error));
    }
  }, [user]);

  const checkUserOrganizer = (organizerId) => {
    return userOrganizers.some(userOrganizer => userOrganizer.organizer.id === organizerId);
  };

  const handleButtonClick = (organizerId, isUserOrganizer) => {
    if (isUserOrganizer) {
      navigate(`/organizers/${organizerId}/update`);
    } else {
      navigate(`/organizers/${organizerId}/details`);
    }
  };

  const handleAddClick = () => {
    navigate('/organizers/add');
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase().trim());
  };

  const filteredOrganizers = organizers.filter(organizer => {
    const organizerType = organizer.organizer_type.toLowerCase().trim();
    console.log('Filtering:', organizerType, 'Filter:', filter); 
    return filter === 'all' || organizerType === filter;
  });

  return (
    <div className={styles.organizerListContainer}>
      <h1>ORGANIZERS</h1>
      {user && user.role === 'admin' && (
        <button onClick={handleAddClick} className={styles.addOrganizerButton}>Add Organizer</button>
      )}
      <div className={styles.filterContainer}>
        <label htmlFor="filter">Filter by type: </label>
        <select id="filter" value={filter} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="school">School</option>
          <option value="tour">Tour</option>
        </select>
      </div>
      <ul className={styles.organizerList}>
        {filteredOrganizers.map(organizer => {
          const isUserOrganizer = checkUserOrganizer(organizer.id);
          return (
            <li key={organizer.id} className={styles.organizerItem}>
              <div className={styles.organizerInfo}>
                <strong>{organizer.organizer_name}</strong>
                <div>{organizer.organizer_type}</div>
              </div>
              <button onClick={() => handleButtonClick(organizer.id, isUserOrganizer)}>
                {isUserOrganizer ? 'Update' : 'Details'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default OrganizerList;
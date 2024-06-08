import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../Shared/UserContext';
import styles from '../Shared/Form.module.css';

const OrganizerForm = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useUser(); 

  const [organizer, setOrganizer] = useState({
    organizer_name: '',
    organizer_type: ''
  });

  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (id) {
      
      setIsUpdate(true);
      axios.get(`http://localhost:8000/api/organizers/${id}/`)
        .then(response => {
          setOrganizer(response.data);
        })
        .catch(error => {
          console.error('Error fetching the organizer:', error);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrganizer({
      ...organizer,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUpdate) {
      axios.put(`http://localhost:8000/api/organizers/${id}/`, organizer)
        .then(response => {
          navigate(`/organizers/${id}/details`);
        })
        .catch(error => {
          console.error('Error updating the organizer:', error);
        });
    } else {
      axios.post('http://localhost:8000/api/organizers/', organizer)
        .then(response => {
          navigate('/organizers');
        })
        .catch(error => {
          console.error('Error creating the organizer:', error);
        });
    }
  };

  if (!user || (user.role !== 'org' && user.role !== 'admin')) {
    return <div>You are not permitted to perform this action.</div>;
  }

  return (
    <div className={styles.formContainer}>
      <h1>{isUpdate ? 'Update Organizer' : 'Create Organizer'}</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="organizer_name">Name</label>
          <input
            type="text"
            id="organizer_name"
            name="organizer_name"
            value={organizer.organizer_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="organizer_type">Type</label>
          <input
            type="text"
            id="organizer_type"
            name="organizer_type"
            value={organizer.organizer_type}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className={styles.button}>{isUpdate ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
};

export default OrganizerForm;
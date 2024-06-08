import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../Shared/UserContext';
import styles from '../Shared/Form.module.css';

const GearForm = () => {
  const { id, gearId } = useParams(); 
  const navigate = useNavigate();
  const { user } = useUser(); 

  const [gear, setGear] = useState({
    gear_name: '',
    gear_type: '',
    size: '',
    is_reserved: false,
    wetsuit_size: '',
    organizer: id  
  });

  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (gearId) {
      
      setIsUpdate(true);
      axiosInstance.get(`http://localhost:8000/api/gears/${gearId}/`)
        .then(response => {
          const gearData = response.data;
          
          gearData.organizer = gearData.organizer?.id || id;
          setGear(gearData);
        })
        .catch(error => {
          console.error('Error fetching the gear:', error);
        });
    }
  }, [gearId, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGear({
      ...gear,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const gearData = {
      ...gear,
      organizer: gear.organizer?.id || gear.organizer || id 
    };
    console.log('Submitting gear data:', gearData); 

    if (isUpdate) {
      axiosInstance.put(`http://localhost:8000/api/gears/${gearId}/`, gearData)
        .then(response => {
          navigate(`/organizers/${id}/details`);
        })
        .catch(error => {
          console.error('Error updating the gear:', error.response.data);
        });
    } else {
      axiosInstance.post('http://localhost:8000/api/gears/', gearData)
        .then(response => {
          navigate(`/organizers/${id}/details`);
        })
        .catch(error => {
          console.error('Error creating the gear:', error.response.data);
        });
    }
  };

  if (!user || (user.role !== 'org' && user.role !== 'admin')) {
    return <div>You are not permitted to perform this action.</div>;
  }

  return (
    <div className={styles.formContainer}>
      <h1>{isUpdate ? 'Update Gear' : 'Create Gear'}</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="gear_name">Name</label>
          <input
            type="text"
            id="gear_name"
            name="gear_name"
            value={gear.gear_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="gear_type">Type</label>
          <select
            id="gear_type"
            name="gear_type"
            value={gear.gear_type}
            onChange={handleChange}
            required
          >
            <option value="Wetsuit">Wetsuit</option>
            <option value="Flippers">Flippers</option>
            <option value="Dive Boots">Dive Boots</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="size">Size</label>
          <input
            type="text"
            id="size"
            name="size"
            value={gear.size}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="is_reserved"
              checked={gear.is_reserved}
              onChange={handleChange}
            />
            Reserved
          </label>
        </div>
        {gear.gear_type === 'Wetsuit' && (
          <div className={styles.formGroup}>
            <label htmlFor="wetsuit_size">Wetsuit Size</label>
            <input
              type="text"
              id="wetsuit_size"
              name="wetsuit_size"
              value={gear.wetsuit_size}
              onChange={handleChange}
            />
          </div>
        )}
        <button type="submit" className={styles.button}>{isUpdate ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
};

export default GearForm;
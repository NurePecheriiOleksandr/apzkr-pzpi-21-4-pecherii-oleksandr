import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Shared/Navbar';
import { UserProvider } from './components/Shared/UserContext';
import Login from './components/Auth/Login';
import AdminPage from './components/Admin/AdminPge';
import OrganizerList from './components/Organizer/OrganizerList';
import GearList from './components/Gear/GearList';
import GearDetail from './components/Gear/GearDetail';
import Register from './components/Auth/Register';
import ActivityList from './components/Activity/ActivityList';
import ActivityDetail from './components/Activity/ActivityDetail';
import ActivityForm from './components/Activity/ActivityForm';
import OrganizerDetail from './components/Organizer/OrganizerDetail';
import OrganizerForm from './components/Organizer/OrganizerForm';
import GearForm from './components/Gear/GearForm';

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ActivityList />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/organizers/:organizerId/activities/create" element={<ActivityForm />} />
          <Route path="/activities/edit/:id" element={<ActivityForm />} />
          <Route path="/organizers" element={<OrganizerList />} />
          <Route path="/organizers/:id/details" element={<OrganizerDetail />} />
          <Route path="/organizers/add" element={<OrganizerForm />} />
          <Route path="/organizers/edit/:id" element={<OrganizerForm />} />
          <Route path="/gears" element={<GearList />} />
          <Route path="/gears/add" element={<GearForm />} />
          <Route path="/gears/:id/details" element={<GearDetail />} />
          <Route path="/gears/edit/:gearId" element={<GearForm />} />
          <Route path="/organizers/:id/add-gear" element={<GearForm />} />
          <Route path="/organizers/:id/edit-gear/:gearId" element={<GearForm />} />
          <Route path="/admin" element={<AdminPage />} /> {/* Add AdminPage Route */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
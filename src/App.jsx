import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Host from './pages/Host';
import EventHall from './pages/EventHall';
import EventRoom from './pages/EventRoom';
import AdminPage from './pages/AdminPage';
import OrganizerHall from './pages/OrganizerHall';
import './index.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/host" element={<Host />} />
        <Route path="/hall" element={<EventHall />} />
        <Route path="/organizer/:organizerId" element={<OrganizerHall />} />
        <Route path="/event/:eventId" element={<EventRoom />} />
        <Route path="/admin/:eventId" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

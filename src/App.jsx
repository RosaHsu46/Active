import React, { useState, useEffect } from 'react';
import UserEntry from './components/UserEntry';
import DateSelector from './components/DateSelector';
import Results from './components/Results';
import './index.css';
import './App.css';
import AdminPanel from './components/AdminPanel';

function App() {
  const [view, setView] = useState('entry'); // entry, select, results, admin
  const [currentUser, setCurrentUser] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [allVotes, setAllVotes] = useState(() => {
    const saved = localStorage.getItem('partyVotes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('partyVotes', JSON.stringify(allVotes));
  }, [allVotes]);

  const handleJoin = (name) => {
    setCurrentUser(name);
    // Check if user already voted
    const existingVote = allVotes.find(v => v.name === name);
    if (existingVote) {
      setSelectedDates(existingVote.dates);
    } else {
      setSelectedDates([]);
    }
    setView('select');
  };

  const handleToggleDate = (date) => {
    setSelectedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  const handleConfirmVotes = () => {
    setAllVotes(prev => {
      const otherVotes = prev.filter(v => v.name !== currentUser);
      return [...otherVotes, { name: currentUser, dates: selectedDates }];
    });
    setView('results');
  };

  const handleReset = () => {
    setCurrentUser('');
    setSelectedDates([]);
    setView('entry');
  };

  const handleClearAllVotes = () => {
    setAllVotes([]);
    localStorage.removeItem('partyVotes');
    handleReset();
  };

  const handleDeleteVote = (nameToDelete) => {
    setAllVotes(prev => prev.filter(v => v.name !== nameToDelete));
  };

  return (
    <div className="app-container">
      {view === 'entry' && <UserEntry onJoin={handleJoin} />}

      {view === 'select' && (
        <DateSelector
          selectedDates={selectedDates}
          onToggleDate={handleToggleDate}
          onConfirm={handleConfirmVotes}
        />
      )}

      {view === 'results' && (
        <Results
          allVotes={allVotes}
          onReset={handleReset}
          onAdminClick={() => setView('admin')}
        />
      )}

      {view === 'admin' && (
        <AdminPanel
          allVotes={allVotes}
          onDeleteVote={handleDeleteVote}
          onClearAll={handleClearAllVotes}
          onBack={() => setView('results')}
        />
      )}
    </div>
  );
}

export default App;

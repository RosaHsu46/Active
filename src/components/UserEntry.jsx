import React, { useState } from 'react';
import './UserEntry.css';

export default function UserEntry({ onJoin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="user-entry-container">
      <h1 className="title">揮別2025尾牙</h1>
      <p className="subtitle">請輸入你的名字以開始投票</p>
      <form onSubmit={handleSubmit} className="entry-form">
        <input
          type="text"
          placeholder="你的名字..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!name.trim()} className="join-btn">
          參加活動
        </button>
      </form>
    </div>
  );
}

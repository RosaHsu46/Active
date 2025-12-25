import React, { useState } from 'react';
import './UserEntry.css';

export default function UserEntry({ onJoin, eventName, isExpired, onViewResults, onCopyLink }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("UserEntry: handleSubmit triggered with name:", name);
    if (name.trim()) {
      console.log("UserEntry: Calling onJoin...");
      onJoin(name.trim());
    } else {
      console.log("UserEntry: Name is empty");
    }
  };

  return (
    <div className="user-entry-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={onCopyLink}
          style={{
            background: 'none',
            border: 'none',
            color: '#3498db',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🔗 複製活動連結
        </button>
      </div>
      <h1 className="event-title">{eventName}</h1>

      <p className="subtitle">請輸入你的名字開始投票</p>

      <form onSubmit={handleSubmit} className="entry-form">
        <input
          type="text"
          className="name-input"
          placeholder="你的名字..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button type="submit" className="start-btn">
          參加活動
        </button>
      </form>

      {isExpired && (
        <div className="expired-notice">
          <p>⛔ 投票已截止</p>
          <button className="view-results-btn" onClick={onViewResults}>
            查看結果
          </button>
        </div>
      )}
    </div>
  );
}

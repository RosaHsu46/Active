import React, { useState } from 'react';
import './AdminPanel.css';

export default function AdminPanel({ allVotes, onDeleteVote, onClearAll, onBack }) {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('密碼錯誤');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-container">
                <h2 className="section-title">管理員登入</h2>
                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="password"
                        placeholder="請輸入管理員密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    {error && <p className="error-msg">{error}</p>}
                    <div className="admin-actions">
                        <button type="submit" className="login-btn">登入</button>
                        <button type="button" className="back-btn" onClick={onBack}>返回</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2 className="section-title">後台管理</h2>
                <button className="logout-btn" onClick={onBack}>登出</button>
            </div>

            <div className="votes-list">
                <h3>投票列表 ({allVotes.length})</h3>
                {allVotes.length === 0 ? (
                    <p className="no-data">目前沒有資料</p>
                ) : (
                    allVotes.map((vote, index) => (
                        <div key={index} className="vote-item">
                            <div className="vote-info">
                                <span className="voter-name">{vote.name}</span>
                                <span className="vote-dates">
                                    {vote.dates.map(d => {
                                        const [day, type] = d.split('-');
                                        return `${day}日(${type === 'lunch' ? '午' : '晚'})`;
                                    }).join(', ')}
                                </span>
                            </div>
                            <button
                                className="delete-btn"
                                onClick={() => {
                                    if (window.confirm(`確定要刪除 ${vote.name} 的投票嗎？`)) {
                                        onDeleteVote(vote.name);
                                    }
                                }}
                            >
                                刪除
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="danger-zone">
                <h3>危險區域</h3>
                <button
                    className="clear-all-btn"
                    onClick={() => {
                        if (window.confirm('確定要刪除所有資料嗎？此動作無法復原！')) {
                            onClearAll();
                        }
                    }}
                >
                    清除所有資料
                </button>
            </div>
        </div>
    );
}

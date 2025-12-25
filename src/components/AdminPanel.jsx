import React, { useState } from 'react';
import './AdminPanel.css';

export default function AdminPanel({ allVotes, onDeleteVote, onClearAll, onBack, correctPassword, eventId }) {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    // Auto-login check
    React.useEffect(() => {
        const token = localStorage.getItem(`admin_token_${eventId}`);
        if (token === 'true') {
            setIsAuthenticated(true);
        }
    }, [eventId]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === correctPassword) {
            setIsAuthenticated(true);
            localStorage.setItem(`admin_token_${eventId}`, 'true');
            setError('');
        } else {
            setError('密碼錯誤');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(`admin_token_${eventId}`);
        setIsAuthenticated(false);
        onBack();
    };

    // Calculate stats
    const voteCounts = {};
    const votersByDate = {};

    allVotes.forEach(vote => {
        vote.dates.forEach(date => {
            // Count
            voteCounts[date] = (voteCounts[date] || 0) + 1;

            // Track voters
            if (!votersByDate[date]) {
                votersByDate[date] = [];
            }
            votersByDate[date].push(vote.name);
        });
    });

    // Sort by count descending
    const sortedDates = Object.entries(voteCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([key, count]) => {
            const [day, type] = key.split('-');
            return {
                key,
                day: parseInt(day),
                type: type === 'lunch' ? '午餐' : '晚餐',
                count,
                voters: votersByDate[key] || []
            };
        });

    const maxVotes = sortedDates.length > 0 ? sortedDates[0].count : 0;

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
                <h2 className="section-title">後台管理看板</h2>
                <div className="header-actions">
                    <button className="danger-btn" onClick={onClearAll}>清空所有資料</button>
                    <button className="logout-btn" onClick={handleLogout}>登出</button>
                </div>
            </div>

            {/* Histogram Section */}
            <div className="chart-section">
                <h3>📊 投票分佈圖</h3>
                <div className="chart-container">
                    {sortedDates.map(item => (
                        <div key={item.key} className="chart-bar-group">
                            <div
                                className="chart-bar"
                                style={{ height: `${(item.count / maxVotes) * 150}px` }}
                                title={`${item.count} 票`}
                            >
                                <span className="bar-count">{item.count}</span>
                            </div>
                            <div className="bar-label">
                                <span>{item.day}日</span>
                                <span className="bar-type">{item.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ranked List Section */}
            <div className="ranked-section">
                <h3>🏆 詳細排名與管理</h3>
                <div className="ranked-list">
                    {sortedDates.map((item, index) => (
                        <div key={item.key} className="ranked-item">
                            <div className="rank-header">
                                <span className="rank-number">#{index + 1}</span>
                                <span className="rank-date">{item.day}日 {item.type}</span>
                                <span className="rank-count">{item.count} 票</span>
                            </div>
                            <div className="voters-list">
                                {item.voters.map(voter => (
                                    <div key={voter} className="voter-tag">
                                        {voter}
                                        <button
                                            className="delete-user-btn"
                                            onClick={() => onDeleteVote(voter)}
                                            title={`刪除 ${voter} 的所有投票`}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {sortedDates.length === 0 && <p className="no-data">目前還沒有任何投票</p>}
                </div>
            </div>
        </div>
    );
}

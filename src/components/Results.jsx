import React from 'react';
import './Results.css';

export default function Results({ allVotes, onReset, onAdminClick }) {
    // Calculate votes per date
    const voteCounts = {};
    allVotes.forEach(vote => {
        vote.dates.forEach(date => {
            voteCounts[date] = (voteCounts[date] || 0) + 1;
        });
    });

    // Sort dates by popularity
    const sortedDates = Object.entries(voteCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([key, count]) => {
            const [day, type] = key.split('-');
            return {
                key,
                day: parseInt(day),
                type: type === 'lunch' ? '午餐' : '晚餐',
                count
            };
        });

    const maxVotes = sortedDates.length > 0 ? sortedDates[0].count : 0;

    return (
        <div className="results-container">
            <h2 className="section-title">大家的時間統計</h2>

            <div className="stats-grid">
                {sortedDates.length === 0 ? (
                    <p className="no-votes">目前還沒有人投票喔！</p>
                ) : (
                    sortedDates.map(({ key, day, type, count }) => (
                        <div key={key} className="stat-item">
                            <div className="stat-date">
                                <span className="month">Jan</span>
                                <span className="day">{day}</span>
                                <span className="type" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{type}</span>
                            </div>
                            <div className="stat-bar-container">
                                <div
                                    className="stat-bar"
                                    style={{ width: `${(count / allVotes.length) * 100}%` }}
                                >
                                    <span className="stat-count">{count} 人</span>
                                </div>
                            </div>
                            <div className="stat-voters">
                                {allVotes.filter(v => v.dates.includes(key)).map(v => v.name).join(', ')}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="actions">
                <button className="reset-btn" onClick={onReset}>
                    返回首頁
                </button>
            </div>

            <div className="footer-link">
                <span onClick={onAdminClick} className="admin-trigger">Admin</span>
            </div>
        </div>
    );
}

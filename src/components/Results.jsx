import React from 'react';
import './Results.css';

export default function Results({ allVotes, onReset, onBackToHall, onAdminClick, month = 1, deadline, isExpired }) {
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthName = monthNames[month - 1];

    // Format deadline
    const formattedDeadline = deadline ? new Date(deadline).toLocaleString() : null;

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
            {formattedDeadline && (
                <div className="deadline-info" style={{ textAlign: 'center', marginBottom: '1rem', color: isExpired ? 'red' : '#666' }}>
                    {isExpired ? '⛔ 投票已截止' : `⏰ 截止時間：${formattedDeadline}`}
                </div>
            )}

            <div className="stats-grid">
                {sortedDates.length === 0 ? (
                    <p className="no-votes">目前還沒有人投票喔！</p>
                ) : (
                    <div className="chart-section" style={{ width: '100%', overflowX: 'auto' }}>
                        <div className="chart-container" style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            height: '200px',
                            gap: '1rem',
                            padding: '1rem 0',
                            minWidth: 'min-content'
                        }}>
                            {sortedDates.map(item => (
                                <div key={item.key} className="chart-bar-group" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: '60px'
                                }}>
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${(item.count / maxVotes) * 150}px`,
                                            width: '40px',
                                            backgroundColor: item.type === '午餐' ? '#f39c12' : '#3498db',
                                            borderRadius: '4px 4px 0 0',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'center',
                                            paddingBottom: '5px',
                                            transition: 'height 0.5s ease'
                                        }}
                                        title={`${item.count} 票`}
                                    >
                                        <span className="bar-count" style={{
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                        }}>{item.count}</span>
                                    </div>
                                    <div className="bar-label" style={{
                                        marginTop: '0.5rem',
                                        textAlign: 'center',
                                        fontSize: '0.9rem',
                                        color: '#555'
                                    }}>
                                        <div style={{ fontWeight: 'bold' }}>{item.day}日</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="reset-btn" onClick={onReset}>
                    返回首頁
                </button>
                <button
                    className="back-hall-btn"
                    onClick={onBackToHall}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: '#5d4037',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px rgba(93, 64, 55, 0.2)'
                    }}
                >
                    🏠 返回活動大廳
                </button>
            </div>
        </div>
    );
}

import React from 'react';
import './DateSelector.css';

export default function DateSelector({ selectedDates, onToggleDate, onConfirm, year = 2026, month = 1 }) {
    const date = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDay = date.getDay(); // 0=Sun, 1=Mon, ...

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const days = [];
    // Fill empty slots for previous month
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    // Fill days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return (
        <div className="date-selector-container">
            <h2 className="section-title">選擇你有空的日期</h2>
            <div className="calendar-header">
                <span>{year}</span>
                <span className="month-name">{monthNames[month - 1]}</span>
            </div>

            <div className="calendar-grid">
                <div className="day-label">Sun</div>
                <div className="day-label">Mon</div>
                <div className="day-label">Tue</div>
                <div className="day-label">Wed</div>
                <div className="day-label">Thu</div>
                <div className="day-label">Fri</div>
                <div className="day-label">Sat</div>

                {days.map((day, index) => {
                    if (!day) return <div key={index} className="empty-day"></div>;

                    const lunchKey = `${day}-lunch`;
                    const dinnerKey = `${day}-dinner`;
                    const isLunchSelected = selectedDates.includes(lunchKey);
                    const isDinnerSelected = selectedDates.includes(dinnerKey);

                    return (
                        <div key={index} className="calendar-day-container">
                            <div className="day-number">{day}</div>
                            <div className="day-options">
                                <button
                                    className={`time-slot ${isLunchSelected ? 'selected' : ''}`}
                                    onClick={() => onToggleDate(lunchKey)}
                                >
                                    午
                                </button>
                                <button
                                    className={`time-slot ${isDinnerSelected ? 'selected' : ''}`}
                                    onClick={() => onToggleDate(dinnerKey)}
                                >
                                    晚
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="actions">
                <button className="confirm-btn" onClick={onConfirm}>
                    確認提交
                </button>
            </div>
        </div>
    );
}

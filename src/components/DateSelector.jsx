import React from 'react';
import './DateSelector.css';

export default function DateSelector({ selectedDates, onToggleDate, onConfirm }) {
    // January 2026
    // Jan 1, 2026 is a Thursday.
    const daysInMonth = 31;
    const startDay = 4; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    const days = [];
    // Fill empty slots for previous month
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    // Fill days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const isSelected = (day) => selectedDates.includes(day);

    return (
        <div className="date-selector-container">
            <h2 className="section-title">選擇你有空的日期</h2>
            <div className="calendar-header">
                <span>2026</span>
                <span className="month-name">January</span>
            </div>

            <div className="calendar-grid">
                <div className="day-label">Sun</div>
                <div className="day-label">Mon</div>
                <div className="day-label">Tue</div>
                <div className="day-label">Wed</div>
                <div className="day-label">Thu</div>
                <div className="day-label">Fri</div>
                <div className="day-label">Sat</div>

                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day ${day ? 'active-day' : 'empty-day'} ${day && isSelected(day) ? 'selected' : ''}`}
                        onClick={() => day && onToggleDate(day)}
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="actions">
                <button className="confirm-btn" onClick={onConfirm}>
                    確認提交
                </button>
            </div>
        </div>
    );
}

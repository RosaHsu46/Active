import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import './EventHall.css';

export default function EventHall() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndCleanupEvents = async () => {
            try {
                const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const now = new Date();
                const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000; // Approx 6 months in ms

                const validEvents = [];

                for (const docSnap of querySnapshot.docs) {
                    const data = docSnap.data();
                    const eventId = docSnap.id;

                    // Check for auto-deletion
                    if (data.deadline) {
                        const deadlineDate = new Date(data.deadline);
                        if (now - deadlineDate > sixMonths) {
                            console.log(`Auto-deleting old event: ${eventId}`);
                            // Delete votes subcollection
                            const batch = writeBatch(db);
                            const votesRef = collection(db, 'events', eventId, 'votes');
                            const votesSnap = await getDocs(votesRef);
                            votesSnap.docs.forEach((vDoc) => {
                                batch.delete(vDoc.ref);
                            });
                            await batch.commit();

                            // Delete event doc
                            await deleteDoc(doc(db, 'events', eventId));
                            continue; // Skip adding to list
                        }
                    }

                    validEvents.push({
                        id: eventId,
                        ...data
                    });
                }
                setEvents(validEvents);
            } catch (error) {
                console.error("Error fetching events: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndCleanupEvents();
    }, []);

    const isExpired = (deadline) => {
        if (!deadline) return false;
        return new Date() > new Date(deadline);
    };

    if (loading) return <div className="loading">載入活動中...</div>;

    return (
        <div className="hall-container">
            <div className="hall-header">
                <button className="back-btn" onClick={() => navigate('/')}>← 返回首頁</button>
                <h1 className="hall-title">🏛️ 活動大廳</h1>
            </div>

            <div className="events-grid">
                {events.length === 0 ? (
                    <div className="no-events">
                        <p>目前沒有活動，快去建立一個吧！</p>
                        <button onClick={() => navigate('/host')}>建立活動</button>
                    </div>
                ) : (
                    events.map(event => (
                        <div
                            key={event.id}
                            className={`event-card ${isExpired(event.deadline) ? 'expired' : ''}`}
                            onClick={() => navigate(`/event/${event.id}`)}
                        >
                            <div className="event-status">
                                {isExpired(event.deadline) ?
                                    <span className="badge expired">已截止</span> :
                                    <span className="badge active">進行中</span>
                                }
                            </div>
                            <h3>{event.name}</h3>
                            <div className="event-info">
                                <p>📅 {event.year}年 {event.month}月</p>
                                <p style={{ fontSize: '0.8rem', color: '#999' }}>ID: {event.id}</p>
                                {event.deadline && (
                                    <p>⏰ 截止: {new Date(event.deadline).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

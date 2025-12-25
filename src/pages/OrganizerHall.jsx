import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Host.css'; // Reuse styles

export default function OrganizerHall() {
    const { organizerId } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create Event State
    const [customId, setCustomId] = useState('');
    const [eventName, setEventName] = useState('');
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(1);
    const [deadline, setDeadline] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    // Verify Auth
    useEffect(() => {
        const current = localStorage.getItem('current_organizer');
        if (current !== organizerId) {
            alert("請先登入");
            navigate('/host');
        }
    }, [organizerId, navigate]);

    // Fetch Events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const q = query(collection(db, 'events'), where('organizerId', '==', organizerId));
                const querySnapshot = await getDocs(q);
                const list = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEvents(list);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };
        if (organizerId) fetchEvents();
    }, [organizerId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!customId.trim() || !eventName.trim()) return;

        const id = customId.trim();
        if (!/^[a-zA-Z0-9]+$/.test(id)) {
            alert("活動 ID 只能包含英文和數字");
            return;
        }

        setCreateLoading(true);
        try {
            const docRef = doc(db, 'events', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                alert("此活動 ID 已被使用");
                setCreateLoading(false);
                return;
            }

            await setDoc(docRef, {
                name: eventName.trim(),
                year: parseInt(year),
                month: parseInt(month),
                deadline: deadline ? new Date(deadline).toISOString() : null,
                organizerId: organizerId, // Link to organizer
                createdAt: new Date(),
                votes: []
            });

            alert("活動建立成功！");
            setCustomId('');
            setEventName('');
            setShowCreate(false);
            // Refresh list
            const q = query(collection(db, 'events'), where('organizerId', '==', organizerId));
            const querySnapshot = await getDocs(q);
            setEvents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error creating event:", error);
            alert("建立失敗");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('current_organizer');
        navigate('/');
    };

    if (loading) return <div className="loading">載入中...</div>;

    return (
        <div className="host-container">
            <div className="host-header">
                <div>
                    <h1 className="host-title">👋 嗨，{organizerId}</h1>
                    <p style={{ color: '#7f8c8d', margin: 0 }}>這是您的專屬活動大廳</p>
                </div>
                <button className="logout-btn" onClick={handleLogout}>登出</button>
            </div>

            <div className="hall-actions" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <button
                    className="create-btn"
                    onClick={() => setShowCreate(!showCreate)}
                    style={{ maxWidth: '200px' }}
                >
                    {showCreate ? '取消建立' : '➕ 建立新活動'}
                </button>
            </div>

            {showCreate && (
                <div className="host-card create-section" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                    <h2>建立新活動</h2>
                    <form onSubmit={handleCreate} className="create-event-form">
                        <div className="form-group">
                            <label>活動 ID (網址用)</label>
                            <input
                                type="text"
                                value={customId}
                                onChange={(e) => setCustomId(e.target.value)}
                                placeholder="例如：party2026 (限英數)"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>活動名稱</label>
                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                placeholder="例如：2026 新年聚餐"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>年份</label>
                                <select value={year} onChange={(e) => setYear(e.target.value)}>
                                    <option value={2025}>2025</option>
                                    <option value={2026}>2026</option>
                                    <option value={2027}>2027</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>月份</label>
                                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{m}月</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>截止時間 (選填)</label>
                            <input
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="create-btn" disabled={createLoading}>
                            {createLoading ? '建立中...' : '確認建立'}
                        </button>
                    </form>
                </div>
            )}

            <div className="events-grid">
                {events.length === 0 ? (
                    <p style={{ width: '100%', textAlign: 'center', color: '#ccc' }}>您還沒有建立任何活動</p>
                ) : (
                    events.map(event => (
                        <div
                            key={event.id}
                            className="event-card"
                            onClick={() => {
                                // Set admin token for this event so AdminPage allows access
                                localStorage.setItem(`admin_token_${event.id}`, 'true');
                                navigate(`/admin/${event.id}`);
                            }}
                            style={{ cursor: 'pointer', border: '1px solid #eee' }}
                        >
                            <div className="event-status">
                                <span className="badge active">管理中</span>
                            </div>
                            <h3>{event.name}</h3>
                            <div className="event-info">
                                <p>ID: {event.id}</p>
                                <p>📅 {event.year}年 {event.month}月</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

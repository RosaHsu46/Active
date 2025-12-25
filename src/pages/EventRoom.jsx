import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import UserEntry from '../components/UserEntry';
import DateSelector from '../components/DateSelector';
import Results from '../components/Results';

export default function EventRoom() {
    const { eventId: rawEventId } = useParams();
    const eventId = rawEventId ? rawEventId.trim() : '';
    const navigate = useNavigate();

    const [eventData, setEventData] = useState(null);
    const [allVotes, setAllVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExpired, setIsExpired] = useState(false);
    const [availableIds, setAvailableIds] = useState([]); // Store IDs if not found

    // App state
    const [view, setView] = useState('entry'); // entry, select, summary, results
    const [currentUser, setCurrentUser] = useState('');
    const [selectedDates, setSelectedDates] = useState([]);

    // 1. Listen to Event Details
    useEffect(() => {
        if (!eventId) return;
        console.log(`[EventRoom] Fetching event with ID: "${eventId}" (Type: ${typeof eventId}, Length: ${eventId.length})`);

        const unsub = onSnapshot(doc(db, 'events', eventId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEventData(data);

                // Check deadline
                if (data.deadline) {
                    const now = new Date();
                    const deadlineDate = new Date(data.deadline);
                    if (now > deadlineDate) {
                        setIsExpired(true);
                        // If user is in entry or select mode, force them to results
                        if (view === 'entry' || view === 'select') {
                            setView('results');
                        }
                    }
                }
                setLoading(false);
            } else {
                console.error(`Event ${eventId} not found.`);

                // Fetch all available IDs to show to the user
                getDocs(collection(db, 'events')).then(snap => {
                    const ids = snap.docs.map(d => d.id);
                    setAvailableIds(ids);
                });

                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching event:", error);
            alert("讀取活動發生錯誤");
            setLoading(false);
        });
        return () => unsub();
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, navigate]); // Removed view to prevent re-subscription loop

    // 2. Listen to Votes Subcollection
    useEffect(() => {
        if (!eventId) return;
        const votesRef = collection(db, 'events', eventId, 'votes');
        const unsub = onSnapshot(votesRef, (snapshot) => {
            const votes = snapshot.docs.map(doc => doc.data());
            setAllVotes(votes);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching votes:", error);
            setLoading(false);
        });
        return () => unsub();
    }, [eventId]);

    const handleJoin = (name) => {
        if (isExpired) {
            alert("投票已截止");
            return;
        }
        console.log("User joining:", name);
        try {
            setCurrentUser(name);
            console.log("allVotes type:", typeof allVotes, "Is Array:", Array.isArray(allVotes), "Length:", allVotes?.length);

            // Check if user already voted
            const existingVote = allVotes && Array.isArray(allVotes) ? allVotes.find(v => v.name === name) : null;

            if (existingVote) {
                console.log("Found existing vote for", name);
                alert(`歡迎回來，${name}！已載入您之前的選擇。`);
                setSelectedDates(existingVote.dates || []);
            } else {
                console.log("No existing vote, new user");
                setSelectedDates([]);
            }

            console.log("Setting view to 'select'. Current view:", view);
            setView('select');
        } catch (err) {
            console.error("Error in handleJoin:", err);
            alert("加入活動時發生錯誤，請查看 Console");
        }
    };

    const handleToggleDate = (date) => {
        setSelectedDates(prev => {
            if (prev.includes(date)) {
                return prev.filter(d => d !== date);
            } else {
                return [...prev, date];
            }
        });
    };

    const handleConfirmVotes = async () => {
        if (isExpired) {
            alert("投票已截止");
            return;
        }
        try {
            // Use name as doc ID for simplicity (assumes unique names)
            await setDoc(doc(db, 'events', eventId, 'votes', currentUser), {
                name: currentUser,
                dates: selectedDates
            });
            setView('summary');
        } catch (error) {
            console.error("Error saving vote:", error);
            alert("儲存失敗，請重試");
        }
    };

    const handleReset = () => {
        setCurrentUser('');
        setSelectedDates([]);
        setView('entry');
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert("連結已複製！快去分享給朋友吧！");
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert("複製失敗，請手動複製網址");
        });
    };

    if (loading) return <div className="loading">載入中...</div>;

    if (!eventData) return (
        <div className="app-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2>⚠️ 找不到活動</h2>
            <p>您搜尋的 ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{eventId}</span></p>

            <div style={{ margin: '2rem 0', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>在此系統中找到的活動 ID:</p>
                {availableIds.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {availableIds.map(id => (
                            <li key={id} style={{ margin: '0.5rem 0' }}>
                                <button
                                    onClick={() => window.location.href = `/event/${id}`}
                                    style={{
                                        color: '#3498db',
                                        background: 'none',
                                        border: '1px solid #3498db',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {id}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>沒有發現任何活動。</p>
                )}
            </div>

            <button
                onClick={() => navigate('/hall')}
                style={{
                    padding: '0.8rem 1.5rem',
                    background: '#556b2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    marginTop: '1rem',
                    cursor: 'pointer'
                }}
            >
                返回活動大廳
            </button>
        </div>
    );

    return (
        <div className="app-container">
            {/* Header Removed as requested */}

            {view === 'entry' && (
                <UserEntry
                    onJoin={handleJoin}
                    eventName={eventData.name}
                    isExpired={isExpired}
                    onViewResults={() => setView('results')}
                    onCopyLink={handleCopyLink}
                />
            )}

            {view === 'select' && (
                <DateSelector
                    selectedDates={selectedDates}
                    onToggleDate={handleToggleDate}
                    onConfirm={handleConfirmVotes}
                    year={eventData.year}
                    month={eventData.month}
                />
            )}

            {view === 'summary' && (
                <div className="summary-container" style={{
                    padding: '2.5rem',
                    background: '#fdfbf7', // Cream
                    borderRadius: '16px',
                    maxWidth: '500px',
                    margin: '2rem auto',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(93, 64, 55, 0.15)',
                    border: '1px solid #efebe9'
                }}>
                    <h2 style={{ color: '#556b2f', marginBottom: '0.5rem', fontSize: '1.8rem' }}>🎉 填寫完成！</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#5d4037' }}>
                        感謝 <strong>{currentUser}</strong> 的參與<br />
                        已為您記錄以下時段：
                    </p>

                    <div className="selected-list" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        marginBottom: '2.5rem',
                        textAlign: 'left',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '0 1rem'
                    }}>
                        {selectedDates.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#8d6e63', padding: '1rem' }}>未選擇任何時段</div>
                        ) : (
                            // Group and sort dates
                            Object.entries(selectedDates.reduce((acc, curr) => {
                                const [day, type] = curr.split('-');
                                if (!acc[day]) acc[day] = [];
                                acc[day].push(type);
                                return acc;
                            }, {})).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([day, types]) => (
                                <div key={day} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.8rem 1.2rem',
                                    background: '#fff',
                                    borderRadius: '12px',
                                    border: '1px solid #e0e0e0',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <span style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: '#5d4037',
                                        width: '60px'
                                    }}>{day}日</span>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {types.includes('lunch') && (
                                            <span style={{
                                                background: '#e6c9a8', // Earthy Tan
                                                color: '#5d4037',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}>午餐 ☀️</span>
                                        )}
                                        {types.includes('dinner') && (
                                            <span style={{
                                                background: '#a1887f', // Earthy Brown
                                                color: '#fff',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}>晚餐 🌙</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="summary-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => setView('select')}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: 'transparent',
                                border: '2px solid #8d6e63',
                                color: '#8d6e63',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                flex: 1
                            }}
                        >
                            ✏️ 修改
                        </button>
                        <button
                            onClick={() => setView('results')}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: '#556b2f', // Olive Green
                                border: 'none',
                                color: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                flex: 1,
                                boxShadow: '0 4px 6px rgba(85, 107, 47, 0.2)'
                            }}
                        >
                            📊 查看統計
                        </button>
                    </div>
                </div>
            )}

            {view === 'results' && (
                <Results
                    allVotes={allVotes}
                    onReset={handleReset}
                    onBackToHall={() => navigate('/hall')}
                    onAdminClick={() => navigate(`/admin/${eventId}`)}
                    month={eventData.month}
                    deadline={eventData.deadline}
                    isExpired={isExpired}
                />
            )}
        </div>
    );
}

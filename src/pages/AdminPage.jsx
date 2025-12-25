import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import "../components/AdminPanel.css";

export default function AdminPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState(null);
    const [allVotes, setAllVotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Verify Auth
    useEffect(() => {
        const token = localStorage.getItem(`admin_token_${eventId}`);
        if (token !== 'true') {
            alert("請先登入");
            navigate('/host');
        }
    }, [eventId, navigate]);

    // Fetch Data
    useEffect(() => {
        if (!eventId) return;

        // Get Event Info
        getDoc(doc(db, 'events', eventId)).then(docSnap => {
            if (docSnap.exists()) {
                setEventData(docSnap.data());
            } else {
                alert("找不到此活動");
                navigate('/host');
            }
        });

        // Listen to Votes
        const votesRef = collection(db, 'events', eventId, 'votes');
        const unsub = onSnapshot(votesRef, (snapshot) => {
            const votes = snapshot.docs.map(doc => doc.data());
            setAllVotes(votes);
            setLoading(false);
        });

        return () => unsub();
    }, [eventId, navigate]);

    const handleDeleteVote = async (nameToDelete) => {
        if (!window.confirm(`確定要刪除 ${nameToDelete} 的投票嗎？`)) return;
        try {
            await deleteDoc(doc(db, 'events', eventId, 'votes', nameToDelete));
        } catch (error) {
            console.error("Error deleting vote:", error);
            alert("刪除失敗");
        }
    };

    const handleClearAllVotes = async () => {
        if (!window.confirm("確定要刪除所有投票紀錄嗎？此動作無法復原。")) return;
        try {
            const batch = writeBatch(db);
            const votesRef = collection(db, 'events', eventId, 'votes');
            const snapshot = await getDocs(votesRef);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            alert("已清空所有投票");
        } catch (error) {
            console.error("Error clearing votes:", error);
            alert("清除失敗");
        }
    };

    const handleDeleteEvent = async () => {
        const confirmStr = prompt(`確定要刪除整個活動嗎？\n這將會永久刪除活動設定以及所有投票資料。\n\n請輸入活動 ID "${eventId}" 以確認刪除：`);
        if (confirmStr !== eventId) {
            if (confirmStr !== null) alert("輸入錯誤，取消刪除");
            return;
        }

        try {
            // 1. Delete all votes
            const batch = writeBatch(db);
            const votesRef = collection(db, 'events', eventId, 'votes');
            const snapshot = await getDocs(votesRef);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // 2. Delete event doc
            await deleteDoc(doc(db, 'events', eventId));

            alert("活動已刪除");
            navigate('/host');
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("刪除活動失敗");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(`admin_token_${eventId}`);
        navigate('/');
    };

    if (loading || !eventData) return <div className="loading">載入中...</div>;

    // --- Stats Logic ---
    const voteCounts = {};
    const votersByDate = {};
    allVotes.forEach(vote => {
        vote.dates.forEach(date => {
            voteCounts[date] = (voteCounts[date] || 0) + 1;
            if (!votersByDate[date]) votersByDate[date] = [];
            votersByDate[date].push(vote.name);
        });
    });

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

    return (
        <div className="admin-container" style={{ marginTop: '2rem' }}>
            <div className="admin-header">
                <div>
                    <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>{eventData.name} - 後台管理</h2>
                    <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>ID: {eventId}</span>
                </div>
                <div className="header-actions">
                    <button className="logout-btn" onClick={() => navigate(`/event/${eventId}`)}>
                        👁️ 查看活動頁
                    </button>
                    {localStorage.getItem('current_organizer') && (
                        <button className="logout-btn" onClick={() => navigate(`/organizer/${localStorage.getItem('current_organizer')}`)}>
                            🏠 回大廳
                        </button>
                    )}
                    <button className="logout-btn" onClick={handleLogout}>登出</button>
                </div>
            </div>

            {/* Histogram */}
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
                    {sortedDates.length === 0 && <p style={{ width: '100%', textAlign: 'center', color: '#ccc' }}>暫無數據</p>}
                </div>
            </div>

            {/* Ranked List */}
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
                                            onClick={() => handleDeleteVote(voter)}
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

            {/* Danger Zone */}
            <div className="danger-zone" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed #e74c3c' }}>
                <h3 style={{ color: '#c0392b' }}>⛔ 危險區域</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="clear-all-btn" onClick={handleClearAllVotes} style={{ backgroundColor: '#e67e22' }}>
                        ⚠️ 清空所有投票
                    </button>
                    <button className="clear-all-btn" onClick={handleDeleteEvent} style={{ backgroundColor: '#c0392b' }}>
                        💣 刪除整個活動
                    </button>
                </div>
                <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '1rem' }}>
                    * 清空投票：只刪除投票資料，保留活動設定。<br />
                    * 刪除活動：永久刪除此活動的所有資料，無法復原。
                </p>
            </div>
        </div>
    );
}

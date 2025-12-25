import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Host.css';

export default function Host() {
    const navigate = useNavigate();
    const [organizerId, setOrganizerId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!organizerId.trim() || !password.trim()) return;

        const id = organizerId.trim();
        // Validate ID format (alphanumeric only)
        if (!/^[a-zA-Z0-9]+$/.test(id)) {
            alert("帳號只能包含英文和數字");
            return;
        }

        setLoading(true);
        try {
            const docRef = doc(db, 'organizers', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Login
                if (docSnap.data().password === password) {
                    localStorage.setItem('current_organizer', id);
                    navigate(`/organizer/${id}`);
                } else {
                    alert("密碼錯誤");
                }
            } else {
                // Register
                if (window.confirm(`帳號 "${id}" 不存在，要直接註冊嗎？`)) {
                    await setDoc(docRef, {
                        password: password,
                        createdAt: new Date()
                    });
                    localStorage.setItem('current_organizer', id);
                    navigate(`/organizer/${id}`);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            alert("登入失敗");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="host-container">
            <div className="host-header">
                <button className="back-btn" onClick={() => navigate('/')}>← 返回首頁</button>
                <h1 className="host-title">🎉 主辦人登入</h1>
            </div>

            <div className="host-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <p className="manage-desc" style={{ textAlign: 'center' }}>
                    輸入您的帳號密碼。<br />如果是第一次使用，系統將自動為您註冊。
                </p>
                <form onSubmit={handleLogin} className="manage-form">
                    <div className="form-group">
                        <label>主辦帳號 (ID)</label>
                        <input
                            type="text"
                            value={organizerId}
                            onChange={(e) => setOrganizerId(e.target.value)}
                            placeholder="例如：alice"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="請輸入密碼"
                            required
                        />
                    </div>
                    <button type="submit" className="manage-btn" disabled={loading} style={{ backgroundColor: '#3498db' }}>
                        {loading ? '處理中...' : '登入 / 註冊'}
                    </button>
                </form>
            </div>
        </div>
    );
}

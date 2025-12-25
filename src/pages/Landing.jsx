import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <h1 className="landing-title">歡迎來到聚餐投票系統</h1>
            <div className="landing-options">
                <div className="option-card host-card" onClick={() => navigate('/host')}>
                    <h2>🎉 我要辦活動</h2>
                    <p>建立新的投票活動，或是管理您已建立的活動。</p>
                </div>
                <div className="option-card hall-card" onClick={() => navigate('/hall')}>
                    <h2>🏛️ 活動大廳</h2>
                    <p>瀏覽目前正在進行的活動，加入大家的聚餐！</p>
                </div>
            </div>
        </div>
    );
}

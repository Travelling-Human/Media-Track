import { useEffect, useState } from 'react';
import { listItems } from '../api/items';
import { timeAgo } from '../utils/time';
import './Page.css';
import './Library.css';
import './History.css';

export default function History() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listItems().then((res) => setItems(res.data.slice(0, 30))).finally(() => setLoading(false));
    }, []);

    return (
        <div className="page">
            <header className="page-header">
                <span className="auth-eyebrow">// MEDIALIST_OS</span>
                <h1 className="page-title">HISTORY</h1>
                <p className="page-subtitle">Your most recently touched items — added, edited, or re-statused.</p>
            </header>

            {loading ? (
                <p className="state-text">LOADING LOG...</p>
            ) : items.length === 0 ? (
                <p className="state-text">No activity yet. Add something to your library to get started.</p>
            ) : (
                <ul className="history-list">
                    {items.map((item) => (
                        <li key={item.id} className="history-row">
                            <span className="history-type">{item.media_type_display}</span>
                            <span className="history-title">{item.title}</span>
                            <span className={`history-status history-status-${item.status}`}>{item.status_display}</span>
                            <span className="history-time">{timeAgo(item.updated_at)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
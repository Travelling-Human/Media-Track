import { useState } from 'react';
import { STATUSES } from '../constants/media';

export default function MediaItemCard({ item, onStatusChange, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Remove "${item.title}" from your archive?`)) return;
        setIsDeleting(true);
        await onDelete(item.id);
    };

    return (
        <div className="item-card">
            <div className="item-cover">
                {item.cover_image_url ? (
                    <img
                        src={item.cover_image_url}
                        alt={item.title}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <span className="item-cover-fallback">{item.media_type_display?.[0] ?? '?'}</span>
                )}
            </div>

            <div className="item-body">
                <span className="item-type">{item.media_type_display}</span>
                <h3 className="item-title">{item.title}</h3>
                {item.rating != null && <span className="item-rating">{item.rating}/10</span>}

                <select
                    className="item-status-select"
                    value={item.status}
                    onChange={(e) => onStatusChange(item.id, e.target.value)}
                >
                    {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>

                <button className="item-delete" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'REMOVING...' : 'REMOVE'}
                </button>
            </div>
        </div>
    );
}
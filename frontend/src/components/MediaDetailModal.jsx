import { useEffect, useState } from 'react';
import { fetchAvailability } from '../api/catalog';
import { MEDIA_TYPES } from '../constants/media';
import './MediaDetailModal.css';

const TYPE_LABELS = Object.fromEntries(MEDIA_TYPES.map((t) => [t.value, t.label]));

const AVAILABILITY_VERB = {
    movie: 'WATCH', tv: 'WATCH', anime: 'WATCH',
    game: 'PLAY',
    book: 'READ', manga: 'READ', manhwa: 'READ', manhua: 'READ',
    music: 'LISTEN',
};

function cleanDescription(text) {
    if (!text) return '';
    return text.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim();
}

export default function MediaDetailModal({ item, onAdd, onClose }) {
    const [availability, setAvailability] = useState(null);
    const [loadingAvailability, setLoadingAvailability] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoadingAvailability(true);
        fetchAvailability(item.__mediaType, item.external_source, item.external_id)
            .then((res) => { if (!cancelled) setAvailability(res.data); })
            .catch(() => { if (!cancelled) setAvailability({ providers: [], note: "Couldn't load availability." }); })
            .finally(() => { if (!cancelled) setLoadingAvailability(false); });
        return () => { cancelled = true; };
    }, [item]);

    const isJustWatchSourced = ['movie', 'tv'].includes(item.__mediaType);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                <div className="detail-cover">
                    {item.cover_image_url ? (
                        <img src={item.cover_image_url} alt={item.title} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <span className="item-cover-fallback">?</span>
                    )}
                </div>

                <div className="detail-body">
                    <span className="auth-panel-eyebrow">&gt; MEDIA_DETAIL</span>
                    <h2 className="detail-title">{item.title}</h2>

                    <div className="detail-tags">
                        <span className="hero-tag">{TYPE_LABELS[item.__mediaType] || item.__mediaType}</span>
                        {item.year && <span className="hero-tag">{item.year}</span>}
                        {item.rating && <span className="hero-tag detail-rating">★ {item.rating}</span>}
                    </div>

                    <p className="detail-description">
                        {cleanDescription(item.description) || 'No description available.'}
                    </p>

                    <div className="detail-availability">
                        <h3 className="detail-section-heading">
                            &gt; WHERE TO {AVAILABILITY_VERB[item.__mediaType] || 'FIND'}
                        </h3>

                        {loadingAvailability ? (
                            <p className="state-text-inline">Checking availability...</p>
                        ) : availability?.providers?.length > 0 ? (
                            <>
                                <div className="provider-list">
                                    {availability.providers.map((p, i) =>
                                        p.link ? (
                                            <a key={i} href={p.link} target="_blank" rel="noopener noreferrer" className="provider-chip">
                                                {p.name}
                                            </a>
                                        ) : (
                                            <span key={i} className="provider-chip provider-chip-static">{p.name}</span>
                                        )
                                    )}
                                </div>
                                {isJustWatchSourced && <p className="detail-attribution">Streaming data via JustWatch.</p>}
                            </>
                        ) : (
                            <p className="state-text-inline">{availability?.note || 'Not available to check for this media type yet.'}</p>
                        )}
                    </div>

                    <div className="detail-actions">
                        <button className="auth-submit detail-add-btn" onClick={() => onAdd(item)}>+ ADD TO ARCHIVE</button>
                        <button className="modal-close detail-close-btn" onClick={onClose}>CLOSE</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
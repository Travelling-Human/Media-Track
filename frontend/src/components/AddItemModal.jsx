import { useState } from 'react';
import { MEDIA_TYPES, STATUSES } from '../constants/media';
import { searchCatalog } from '../api/catalog';
import { createItem } from '../api/items';
import { useToast } from '../context/ToastContext';
import '../pages/Auth.css';

export default function AddItemModal({ onClose, onAdded, initialMediaType, initialSelection }) {
    const [mediaType, setMediaType] = useState(initialMediaType || 'movie');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [selected, setSelected] = useState(initialSelection || null);
    const [manualMode, setManualMode] = useState(false);
    const [manualTitle, setManualTitle] = useState('');
    const [status, setStatus] = useState('planned');
    const [rating, setRating] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const skipSearch = Boolean(initialSelection);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsSearching(true);
        setSearchError('');
        setResults([]);
        setSelected(null);
        try {
            const { data } = await searchCatalog(mediaType, query.trim());
            setResults(data.results);
            if (data.results.length === 0) setSearchError('NO_MATCHES — try a different search');
        } catch {
            setSearchError("SEARCH_FAILED — the catalog service didn't respond. Try again later");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = manualMode
                ? { title: manualTitle.trim(), media_type: mediaType, status, rating: rating ? Number(rating) : null, notes }
                : {
                    title: selected.title,
                    media_type: mediaType,
                    status,
                    rating: rating ? Number(rating) : null,
                    notes,
                    cover_image_url: selected.cover_image_url,
                    external_source: selected.external_source,
                    external_id: selected.external_id,
                };
            const { data } = await createItem(payload);
            onAdded(data);
            showToast(`"${payload.title}" added to your archive.`);
            onClose();
        } catch (err) {
            console.error('Failed to save item:', err.response?.data || err.message);
            const backendMessage = err.response?.data
                ? Object.entries(err.response.data)
                    .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(' ')}`)
                    .join(' — ')
                : null;
            setSearchError(backendMessage || 'SAVE_FAILED — check the fields and try again.');

        } finally {
            setIsSaving(false);
        }
    };

    const readyToSave = manualMode ? manualTitle.trim().length > 0 : selected !== null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <span className="auth-panel-eyebrow">&gt; ADD_TO_ARCHIVE</span>
                <h2>Add an item</h2>

                {skipSearch ? (
                    <div className="modal-preselected">
                        {selected.cover_image_url ? (
                            <img src={selected.cover_image_url} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                            <span className="item-cover-fallback">?</span>
                        )}
                        <span>{selected.title}{selected.year ? ` (${selected.year})` : ''}</span>
                    </div>
                ) : (
                    <>
                        <form className="modal-search-form" onSubmit={handleSearch}>
                            <select
                                value={mediaType}
                                onChange={(e) => { setMediaType(e.target.value); setResults([]); setSelected(null); }}
                            >
                                {MEDIA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <input
                                className="auth-input"
                                placeholder="Search title..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button type="submit" className="auth-submit modal-scan-btn" disabled={isSearching}>
                                {isSearching ? 'SCANNING...' : 'SCAN'}
                            </button>
                        </form>

                        {searchError && <p className="auth-error">{searchError}</p>}

                        {results.length > 0 && !manualMode && (
                            <div className="search-results">
                                {results.map((r) => (
                                    <button
                                        key={`${r.external_source}-${r.external_id}`}
                                        type="button"
                                        className={`search-result ${selected?.external_id === r.external_id ? 'search-result-active' : ''}`}
                                        onClick={() => setSelected(r)}
                                    >
                                        {r.cover_image_url ? (
                                            <img src={r.cover_image_url} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                                        ) : <span className="item-cover-fallback">?</span>}
                                        <span>{r.title} {r.year && <em>({r.year})</em>}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            className="modal-manual-toggle"
                            onClick={() => { setManualMode(!manualMode); setSelected(null); }}
                        >
                            {manualMode ? '\u2190 Search the catalog instead' : "Can't find it? Add manually"}
                        </button>

                        {manualMode && (
                            <input
                                className="auth-input"
                                placeholder="Title"
                                value={manualTitle}
                                onChange={(e) => setManualTitle(e.target.value)}
                            />
                        )}
                    </>
                )}

                {(selected || manualMode) && (
                    <div className="modal-details">
                        <label className="auth-label">&gt; STATUS</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>

                        <label className="auth-label">&gt; RATING (OPTIONAL, 1-10)</label>
                        <input
                            className="auth-input"
                            type="number"
                            min="1"
                            max="10"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        />

                        <label className="auth-label">&gt; NOTES (OPTIONAL)</label>
                        <textarea
                            className="auth-input"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        <button className="auth-submit" onClick={handleSave} disabled={!readyToSave || isSaving}>
                            {isSaving ? 'SAVING...' : 'ADD TO ARCHIVE'}
                        </button>
                    </div>
                )}

                {searchError && skipSearch && <p className="auth-error">{searchError}</p>}

                <button className="modal-close" type="button" onClick={onClose}>CLOSE</button>
            </div>
        </div>
    );
}
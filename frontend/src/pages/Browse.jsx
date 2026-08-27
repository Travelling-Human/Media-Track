import { useState } from 'react';
import { MEDIA_TYPES } from '../constants/media';
import { searchCatalog } from '../api/catalog';
import AddItemModal from '../components/AddItemModal';
import MediaDetailModal from '../components/MediaDetailModal';
import './Page.css';
import './Browse.css';

export default function Browse() {
    const [mediaType, setMediaType] = useState('movie');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [addTarget, setAddTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);

    const runSearch = async (searchQuery, searchType, targetPage) => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setError('');
        try {
            const { data } = await searchCatalog(searchType, searchQuery.trim(), targetPage);
            setResults(data.results);
            setTotalPages(data.total_pages);
            setPage(data.page);
            if (data.results.length === 0) setError('NO_MATCHES for that search.');
        } catch {
            setError("SEARCH_FAILED — the catalog service didn't respond.");
            setResults([]);
            setTotalPages(1);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        runSearch(query, mediaType, 1);
    };

    const goToPage = (targetPage) => {
        if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
        runSearch(query, mediaType, targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const pageWindow = [];
    for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) {
        pageWindow.push(p);
    }

    return (
        <div className="page">
            <header className="page-header">
                <span className="auth-eyebrow">// MEDIALIST_OS</span>
                <h1 className="page-title">BROWSE</h1>
                <p className="page-subtitle">
                    Search movies, series, books, games, anime, manga, manhwa, manhua, and music, then add straight to your library.
                </p>
            </header>

            <form className="browse-search-form" onSubmit={handleSearch}>
                <select
                    value={mediaType}
                    onChange={(e) => { setMediaType(e.target.value); setResults([]); setTotalPages(1); setPage(1); setError(''); }}
                >
                    {MEDIA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input
                    className="auth-input browse-search-input"
                    placeholder="Search title..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="auth-submit" disabled={isSearching}>
                    {isSearching ? 'SCANNING...' : 'SCAN'}
                </button>
            </form>

            {error && <p className="auth-error">{error}</p>}

            <div className="browse-grid">
                {results.map((r) => (
                    <div
                        key={`${r.external_source}-${r.external_id}`}
                        className="browse-card"
                        onClick={() => setDetailTarget({ ...r, __mediaType: mediaType })}
                    >
                        <div className="item-cover">
                            {r.cover_image_url ? (
                                <img src={r.cover_image_url} alt={r.title} onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : <span className="item-cover-fallback">?</span>}
                        </div>
                        <div className="browse-card-body">
                            <span className="browse-card-title">{r.title} {r.year ? `(${r.year})` : ''}</span>
                            <button className="browse-add-btn" onClick={(e) => { e.stopPropagation(); setAddTarget(r); }}>+ ADD</button>
                        </div>
                    </div>
                ))}
            </div>

            {results.length > 0 && totalPages > 1 && (
                <div className="browse-pagination">
                    <button className="page-nav-btn" onClick={() => goToPage(page - 1)} disabled={page === 1}>&lt; PREV</button>
                    {pageWindow[0] > 1 && <span className="page-ellipsis">...</span>}
                    {pageWindow.map((p) => (
                        <button
                            key={p}
                            className={`page-number-btn ${p === page ? 'page-number-active' : ''}`}
                            onClick={() => goToPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                    {pageWindow[pageWindow.length - 1] < totalPages && <span className="page-ellipsis">...</span>}
                    <button className="page-nav-btn" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>NEXT &gt;</button>
                </div>
            )}

            {detailTarget && (
                <MediaDetailModal
                    item={detailTarget}
                    onAdd={(item) => { setDetailTarget(null); setAddTarget(item); }}
                    onClose={() => setDetailTarget(null)}
                />
            )}

            {addTarget && (
                <AddItemModal
                    initialMediaType={mediaType}
                    initialSelection={addTarget}
                    onClose={() => setAddTarget(null)}
                    onAdded={() => setAddTarget(null)}
                />
            )}
        </div>
    );
}
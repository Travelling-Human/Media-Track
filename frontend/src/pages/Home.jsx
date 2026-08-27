import { useEffect, useState } from 'react';
import { fetchTrending } from '../api/catalog';
import { useAuth } from '../context/AuthContext';
import HeroCarousel from '../components/HeroCarousel';
import TrendingRow from '../components/TrendingRow';
import AddItemModal from '../components/AddItemModal';
import MediaDetailModal from '../components/MediaDetailModal';
import './Page.css';
import './Home.css';

export default function Home() {
    const { username } = useAuth();
    const [trending, setTrending] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detailTarget, setDetailTarget] = useState(null);
    const [addTarget, setAddTarget] = useState(null);

    useEffect(() => {
        fetchTrending()
            .then((res) => setTrending(res.data))
            .catch(() => setError('TRENDING_UNAVAILABLE — try Browse instead.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="page"><p className="state-text">SCANNING THIS WEEK'S TRENDING...</p></div>;
    }

    if (error) {
        return (
            <div className="page">
                <header className="page-header">
                    <span className="auth-eyebrow">// MEDIALIST_OS</span>
                    <h1 className="page-title">WELCOME, {username?.toUpperCase()}</h1>
                </header>
                <p className="auth-error">{error}</p>
            </div>
        );
    }

    return (
        <div className="home">
            {trending.movie.length === 0 ? (
                <div className="page"><p className="state-text">No trending movies available right now — check back soon.</p></div>
            ) : (
                <HeroCarousel movies={trending.movie} onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
            )}

            <div className="home-rows">
                <TrendingRow title="Trending Movies" items={trending.movie} mediaType="movie" onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
                <TrendingRow title="Trending Series" items={trending.tv} mediaType="tv" onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
                <TrendingRow title="Trending Anime" items={trending.anime} mediaType="anime" onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
                <TrendingRow title="Trending Games" items={trending.game} mediaType="game" onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
                <TrendingRow title="Trending Book" items={trending.book} mediaType="book" onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
                <TrendingRow title="Trending Manga" items={trending.manga} mediaType="manga" onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
                <TrendingRow title="Trending Manhwa" items={trending.manhwa} mediaType="manhwa" onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
                <TrendingRow title="Trending Manhua" items={trending.manhua} mediaType="manhua" onAdd={setAddTarget} onOpenDetail={setDetailTarget} />
            </div>

            {detailTarget && (
                <MediaDetailModal
                    item={detailTarget}
                    onAdd={(item) => { setDetailTarget(null); setAddTarget(item); }}
                    onClose={() => setDetailTarget(null)}
                />
            )}

            {addTarget && (
                <AddItemModal
                    initialMediaType={addTarget.__mediaType}
                    initialSelection={addTarget}
                    onClose={() => setAddTarget(null)}
                    onAdded={() => setAddTarget(null)}
                />
            )}
        </div>
    );
}
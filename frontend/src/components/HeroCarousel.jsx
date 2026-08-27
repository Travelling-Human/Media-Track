import { useEffect, useRef, useState } from 'react';
import './HeroCarousel.css';

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export default function HeroCarousel({ movies, onAdd, onOpenDetail }) {
    const [active, setActive] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || movies.length <= 1) return;

        timerRef.current = setInterval(() => {
            setActive((prev) => (prev + 1) % movies.length);
        }, 7000);

        return () => clearInterval(timerRef.current);
    }, [movies.length]);

    if (movies.length === 0) return null;

    const movie = movies[active];

    return (
        <div
            className="hero-carousel"
            style={{ backgroundImage: movie.backdrop_url ? `url(${movie.backdrop_url})` : 'none' }}
        >
            <div className="hero-scrim" />

            <div className="hero-content" onClick={() => onOpenDetail({ ...movie, __mediaType: 'movie' })}>
                <span className="hero-badge"> {ORDINALS[active] || `${active + 1}th`} On Trend</span>
                <h1 className="hero-title">{movie.title}</h1>
                <div className="hero-tags">
                    {movie.year && <span className="hero-tag">{movie.year}</span>}
                    <span className="hero-tag">Movie</span>
                </div>
                {movie.description && <p className="hero-description">{movie.description}</p>}
                <button className="auth-submit hero-add-btn" onClick={(e) => { e.stopPropagation(); onAdd({ ...movie, __mediaType: 'movie' }) }}>
                    + ADD TO ARCHIVE
                </button>
            </div>

            {movies.length > 1 && (
                <div className="hero-dots">
                    {movies.map((_, i) => (
                        <button
                            key={i}
                            className={`hero-dot ${i === active ? 'hero-dot-active' : ''}`}
                            onClick={() => setActive(i)}
                            aria-label={`Show trending pick ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
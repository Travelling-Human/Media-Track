import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TrendingRow.css';

export default function TrendingRow({ title, items, mediaType, onAdd, onOpenDetail }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };

    useEffect(() => {
        updateScrollState();
    }, [items]);

    const scrollByAmount = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
    };

    if (!items || items.length === 0) return null;

    return (
        <section className="trending-row">
            <h2 className="trending-row-title">{title}</h2>

            <div className="trending-row-wrap">
                {canScrollLeft && (
                    <button className="trending-nav trending-nav-left" onClick={() => scrollByAmount(-1)} aria-label={`Scroll ${title} left`}>
                        <ChevronLeft size={22} />
                    </button>
                )}

                <div className="trending-row-scroll" ref={scrollRef} onScroll={updateScrollState}>
                    {items.map((item) => (
                        <div
                            key={`${item.external_source}-${item.external_id}`}
                            className="trending-card"
                            onClick={() => onOpenDetail({ ...item, __mediaType: mediaType })}
                        >
                            <div className="item-cover">
                                {item.cover_image_url ? (
                                    <img src={item.cover_image_url} alt={item.title} onError={(e) => { e.target.style.display = 'none'; }} />
                                ) : (
                                    <span className="item-cover-fallback">?</span>
                                )}
                                <button
                                    className="trending-add-btn"
                                    onClick={(e) => { e.stopPropagation(); onAdd({ ...item, __mediaType: mediaType }); }}
                                >
                                    + ADD
                                </button>
                            </div>
                            <span className="trending-card-title">{item.title}{item.year ? ` (${item.year})` : ''}</span>
                        </div>
                    ))}
                </div>

                {canScrollRight && (
                    <button className="trending-nav trending-nav-right" onClick={() => scrollByAmount(1)} aria-label={`Scroll ${title} right`}>
                        <ChevronRight size={22} />
                    </button>
                )}
            </div>
        </section>
    );
}
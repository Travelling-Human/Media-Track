import { useEffect, useState, useCallback } from 'react';
import { listItems, updateItem, deleteItem } from '../api/items';
import { MEDIA_TYPES } from '../constants/media';
import StatusTabs from '../components/StatusTabs';
import MediaItemCard from '../components/MediaItemCard';
import AddItemModal from '../components/AddItemModal';
import ExportMenu from '../components/ExportMenu';
import './Page.css';
import './Library.css';

export default function Library() {
    const [activeStatus, setActiveStatus] = useState('all');
    const [activeType, setActiveType] = useState('all');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchItems = useCallback(() => {
        setLoading(true);
        const params = {};
        if (activeStatus !== 'all') params.status = activeStatus;
        if (activeType !== 'all') params.media_type = activeType;
        return listItems(params)
            .then((res) => setItems(res.data))
            .finally(() => setLoading(false));
    }, [activeStatus, activeType]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleStatusChange = async (id, newStatus) => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
        try {
            await updateItem(id, { status: newStatus });
            if (activeStatus !== 'all' && newStatus !== activeStatus) {
                setItems((prev) => prev.filter((i) => i.id !== id));
            }
        } catch {
            fetchItems();
        }
    };

    const handleDelete = async (id) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        try {
            await deleteItem(id);
        } catch {
            fetchItems();
        }
    };

    return (
        <div className="page">
            <header className="page-header library-header">
                <div>
                    <span className="auth-eyebrow">// MEDIALIST_OS</span>
                    <h1 className="page-title">LIBRARY</h1>
                </div>
                <div className="library-header-actions">
                    <ExportMenu />
                    <button className="auth-submit" onClick={() => setModalOpen(true)}>+ ADD ITEM</button>
                </div>
            </header>

            <div className="library-controls">
                <StatusTabs active={activeStatus} onChange={setActiveStatus} />
                <select
                    className="library-type-filter"
                    value={activeType}
                    onChange={(e) => setActiveType(e.target.value)}
                >
                    <option value="all">All types</option>
                    {MEDIA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            {loading ? (
                <p className="state-text">LOADING LIBRARY...</p>
            ) : items.length === 0 ? (
                <p className="state-text">Nothing here yet. Hit "+ ADD ITEM" or head to Browse to find something.</p>
            ) : (
                <div className="item-grid">
                    {items.map((item) => (
                        <MediaItemCard
                            key={item.id}
                            item={item}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {modalOpen && (
                <AddItemModal onClose={() => setModalOpen(false)} onAdded={fetchItems} />
            )}
        </div>
    );
}
import { STATUSES } from '../constants/media';

export default function StatusTabs({ active, onChange }) {
    const tabs = [{ value: 'all', label: 'All' }, ...STATUSES];

    return (
        <div className="status-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    className={`status-tab ${active === tab.value ? 'status-tab-active' : ''}`}
                    onClick={() => onChange(tab.value)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
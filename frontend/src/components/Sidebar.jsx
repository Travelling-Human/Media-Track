import { NavLink } from 'react-router-dom';
import { Home, Compass, Library as LibraryIcon, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/browse', icon: Compass, label: 'Browse' },
    { to: '/library', icon: LibraryIcon, label: 'Library' },
    { to: '/history', icon: HistoryIcon, label: 'History' },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo" title="Logo placeholder">M</div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                        title={label}
                    >
                        <Icon size={20} strokeWidth={1.75} />
                    </NavLink>
                ))}
            </nav>

            <NavLink
                to="/settings"
                className={({ isActive }) => `sidebar-link sidebar-settings ${isActive ? 'sidebar-link-active' : ''}`}
                title="Settings"
            >
                <SettingsIcon size={20} strokeWidth={1.75} />
            </NavLink>
        </aside>
    );
}
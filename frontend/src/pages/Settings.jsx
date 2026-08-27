import { useAuth } from '../context/AuthContext';
import './Page.css';
import './Settings.css';

export default function Settings() {
    const { username, logout } = useAuth();

    return (
        <div className="page">
            <header className="page-header">
                <span className="auth-eyebrow">// MEDIALIST_OS</span>
                <h1 className="page-title">SETTINGS</h1>
                <p className="page-subtitle">Account and general preferences.</p>
            </header>

            <section className="settings-section">
                <h2 className="settings-heading">&gt; ACCOUNT</h2>
                <div className="settings-row">
                    <span className="settings-label">Username</span>
                    <span className="settings-value">{username}</span>
                </div>
                <button className="btn-danger-outline" onClick={logout}>LOG OUT</button>
            </section>

            <section className="settings-section">
                <h2 className="settings-heading">&gt; GENERAL</h2>
                <p className="settings-placeholder">
                    More preferences — theme options, notification settings, default library view — land here as the app grows.
                </p>
            </section>
        </div>
    );
}
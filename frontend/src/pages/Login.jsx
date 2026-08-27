import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(username, password);
            navigate('/');
        } catch {
            setError('ACCESS_DENIED — check your credentials and retry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-brand">
                <span className="auth-eyebrow">// MEDIALIST_OS v1.0</span>
                <h1 className="glitch-heading" data-text="NIGHT CITY ARCHIVE">NIGHT CITY ARCHIVE</h1>
                <p className="auth-tagline">
                    Every movie. Every book. Every drop. Logged, tracked, and never lost in the sprawl.
                </p>
            </div>

            <div className="auth-panel">
                <span className="auth-panel-eyebrow">&gt; ACCESS_TERMINAL</span>
                <h2>Log in</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label" htmlFor="username">&gt; USERNAME</label>
                    <input
                        id="username"
                        className="auth-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                    />

                    <label className="auth-label" htmlFor="password">&gt; PASSWORD</label>
                    <input
                        id="password"
                        type="password"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />

                    <button type="submit" className="auth-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'AUTHENTICATING...' : 'JACK IN'}
                    </button>
                </form>

                {error && <p className="auth-error">{error}</p>}

                <p className="auth-switch">
                    No account? <Link to="/register">Register a new identity</Link>
                </p>
            </div>
        </div>
    );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await register(username, email, password);
            navigate('/');
        } catch {
            setError('REGISTRATION_FAILED — username may already be taken.');
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
                <span className="auth-panel-eyebrow">&gt; NEW_USER_REGISTRATION</span>
                <h2>Create an account</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label" htmlFor="username">&gt; USERNAME</label>
                    <input
                        id="username"
                        className="auth-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                    />

                    <label className="auth-label" htmlFor="email">&gt; EMAIL</label>
                    <input
                        id="email"
                        type="email"
                        className="auth-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />

                    <label className="auth-label" htmlFor="password">&gt; PASSWORD</label>
                    <input
                        id="password"
                        type="password"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />

                    <button type="submit" className="auth-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'INITIALIZING...' : 'INITIALIZE ACCOUNT'}
                    </button>
                </form>

                {error && <p className="auth-error">{error}</p>}

                <p className="auth-switch">
                    Already registered? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}
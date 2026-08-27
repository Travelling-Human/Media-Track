import { useToast } from '../context/ToastContext';
import './ToastContainer.css';

export default function ToastContainer() {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-stack">
            {toasts.map((toast) => (
                <div key={toast.id} className="toast" onClick={() => dismissToast(toast.id)}>
                    <span className="toast-marker">&gt;</span> {toast.message}
                </div>
            ))}
        </div>
    );
}
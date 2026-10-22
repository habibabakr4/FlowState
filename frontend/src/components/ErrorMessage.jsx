import { AlertCircle, X } from 'lucide-react';

/**
 * Reusable ErrorMessage / Alert component
 * 
 * Props:
 * - message: string - The error text to display (if null or empty, renders nothing)
 * - onClose: function (optional) - Callback when user clicks the dismiss button
 */
export default function ErrorMessage({ message, onClose }) {
  // If there's no message, don't render anything in the DOM
  if (!message) return null;

  return (
    <div className="alert-box alert-error" role="alert">
      <AlertCircle className="alert-icon" size={18} />
      <span className="alert-text">{message}</span>
      {onClose && (
        <button
          type="button"
          className="alert-close-btn"
          onClick={onClose}
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

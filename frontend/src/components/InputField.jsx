import React from 'react';

export default function InputField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  trailingAction,
  required = true,
  autoComplete,
  error,
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-wrapper-error' : ''}`}>
        {Icon && (
          <span className="input-icon-left">
            <Icon size={18} />
          </span>
        )}
        <input
          id={id || name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className={`form-input ${error ? 'form-input-error' : ''}`}
        />
        {trailingAction}
      </div>
      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
}

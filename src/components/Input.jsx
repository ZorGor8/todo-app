import React from 'react';
import './Input.css'; // Создадим этот файл стилей позже

const Input = ({ value, onChange, placeholder = '', type = 'text', className = '' }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`input ${className}`}
    />
  );
};

export default Input;
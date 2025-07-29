import React from 'react';
// Стили для спиннера уже находятся в ToDoPage.css,
// поэтому здесь не нужен отдельный импорт CSS.

const LoadingSpinner = ({ message = "Загрузка..." }) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

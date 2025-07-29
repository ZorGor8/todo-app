import React from 'react';
// Стили для уведомлений уже находятся в ToDoPage.css,
// поэтому здесь не нужен отдельный импорт CSS,
// если Notification.jsx используется только внутри ToDoPage.
// Если бы это был полностью независимый компонент,
// у него был бы свой файл Notification.css.

const Notification = ({ message, visible }) => {
  if (!visible) {
    return null; // Не отображаем компонент, если он не видим
  }

  return (
    <div className="notification">
      {message}
    </div>
  );
};

export default Notification;

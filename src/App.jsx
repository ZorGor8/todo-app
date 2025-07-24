import React, { useState, useEffect } from 'react'; // Импортируем useState и useEffect
import { Routes, Route, Link } from 'react-router-dom'; // Добавляем Link для навигации
import ToDoPage from './pages/ToDoPage';
import TodoDetailsPage from './pages/TodoDetailsPage';
import './App.css'; // Ваш общий CSS для App
import './index.css'; // Убедитесь, что index.css импортирован для глобальных стилей темы

function App() {
  // Инициализация состояния темы из localStorage.
  // Если в localStorage есть 'theme', используем его; иначе по умолчанию 'light'.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // useEffect для применения класса темы к элементу <body>
  useEffect(() => {
    document.body.className = theme; // Устанавливаем класс 'light' или 'dark'
  }, [theme]); // Зависимость: эффект срабатывает при изменении темы

  // Функция для переключения темы
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Сохраняем новую тему в localStorage
  };

  return (
    <div className={`App ${theme}`}> {/* Добавляем класс темы к корневому div */}
      {/* Переключатель темы */}
      <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="theme-toggle-button">
          Переключить на {theme === 'light' ? 'Тёмную' : 'Светлую'} тему
        </button>
      </div>

      <Routes>
        <Route path="/" element={<ToDoPage />} />
        <Route path="/todo/:id" element={<TodoDetailsPage />} />
      </Routes>
    </div>
  );
}

export default App;
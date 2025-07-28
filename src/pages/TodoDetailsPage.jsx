import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const TodoDetailsPage = () => {
  const { id } = useParams(); // Получаем ID задачи из URL
  const navigate = useNavigate(); // Хук для программной навигации (например, кнопка "Назад")
  const [todo, setTodo] = useState(null); // Состояние для хранения деталей найденной задачи

  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      const todos = storedTodos ? JSON.parse(storedTodos) : [];
      // Ищем задачу по ID. Преобразуем id из URL в строку для сравнения, так как t.id - число.
      const foundTodo = todos.find(t => String(t.id) === id);
      setTodo(foundTodo); // Устанавливаем найденную задачу в состояние
    } catch (error) {
      console.error("Failed to load todo details from localStorage", error);
      setTodo(null); // В случае ошибки или если задача не найдена
    }
  }, [id]); // Зависимость от id из URL: эффект перезапускается при изменении ID

  // Обработчик для кнопки "Вернуться назад"
  const handleBackClick = () => {
    navigate(-1); // Возвращаемся на предыдущую страницу в истории браузера
  };

  // Если задача не найдена (todo === null), отображаем сообщение об ошибке
  if (!todo) {
    return (
      <div className="todo-details-container">
        {/* Хлебные крошки для случая "Задача не найдена" */}
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">Главная</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Задача не найдена</span>
        </div>
        <h1>Задача не найдена</h1>
        <p>К сожалению, задача с ID "{id}" не найдена.</p>
        <button onClick={handleBackClick} className="back-button" type="button">
          Вернуться назад
        </button>
      </div>
    );
  }

  // Если задача найдена, отображаем её детали
  return (
    <div className="todo-details-container">
      {/* Хлебные крошки */}
      <div className="breadcrumbs">
        <Link to="/" className="breadcrumb-link">Главная</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Детали задачи "{todo.text}"</span>
      </div>

      <h1>Детали задачи</h1>
      <p><strong>ID:</strong> {todo.id}</p>
      <p><strong>Текст:</strong> {todo.text}</p>
      <p><strong>Статус:</strong> {todo.completed ? 'Выполнена' : 'Не выполнена'}</p>
      <p><strong>Избранное:</strong> {todo.isFavorite ? 'Да ⭐' : 'Нет'}</p>

      <button onClick={handleBackClick} className="back-button" type="button">
        Вернуться назад
      </button>
    </div>
  );
};

export default TodoDetailsPage;

import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import './ToDoPage.css';
import { Link } from 'react-router-dom'; // Импортируем Link для навигации к деталям

const ToDoPage = () => {
  // Инициализация состояния todos из localStorage.
  // Эта функция-инициализатор выполняется только один раз при монтировании компонента.
  const [todos, setTodos] = useState(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      return storedTodos ? JSON.parse(storedTodos) : [];
    } catch (error) {
      console.error("Failed to load todos from localStorage", error);
      return [];
    }
  });

  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [filter, setFilter] = useState('all');


  // useEffect для СОХРАНЕНИЯ в localStorage.
  // Этот эффект срабатывает при каждом изменении массива 'todos'.
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);


  // Функция для отображения уведомлений
  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 2000);
  };


  // Обработчик добавления новой задачи
  const handleAddTodo = () => {
    if (newTodoText.trim() === '') return;

    const newTodo = {
      id: Date.now(),
      text: newTodoText,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText('');
    showNotification('Задача добавлена!');
  };

  // Обработчик переключения статуса задачи (выполнена/не выполнена)
  const handleToggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Обработчик удаления задачи с анимацией
  const handleDeleteTodo = (idToDelete) => {
      // Ищем элемент LI по его ID, который мы добавили в JSX
      const todoToDeleteElement = document.getElementById(`todo-item-${idToDelete}`);

      if (todoToDeleteElement) {
          // Если элемент найден, добавляем класс для начала анимации исчезновения
          todoToDeleteElement.classList.add('fade-out');

          // Удаляем задачу из состояния после завершения анимации
          setTimeout(() => {
              setTodos(todos.filter(todo => todo.id !== idToDelete));
              showNotification('Задача удалена!');
          }, 300); // Длительность должна совпадать с длительностью CSS-анимации
      } else {
          // Если по какой-то причине элемент не найден, просто удаляем задачу без анимации
          setTodos(todos.filter(todo => todo.id !== idToDelete));
          showNotification('Задача удалена!');
      }
  };

  // Функции для редактирования
  const handleEditClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const handleSaveEdit = (id) => {
    if (editingText.trim() === '') {
      handleDeleteTodo(id); // Если текст пуст, удаляем задачу
      showNotification('Задача удалена (пустой текст)!');
      return;
    }
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editingText } : todo
    ));
    setEditingTodoId(null);
    setEditingText('');
    showNotification('Задача обновлена!');
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingText('');
  };

  // Обработчик для удаления всех выполненных задач
  const handleClearCompleted = () => {
    const activeTodos = todos.filter(todo => !todo.completed);
    setTodos(activeTodos);
    if (todos.length > activeTodos.length) { // Показываем уведомление, только если что-то было удалено
      showNotification('Выполненные задачи очищены!');
    }
  };


  // Вычисляемые задачи для отображения в зависимости от текущего фильтра
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }
    if (filter === 'completed') {
      return todo.completed;
    }
    return true; // filter === 'all'
  });


  return (
    <div className="todo-container">
      <h1>Мой Список Дел</h1>

      {/* Блок для отображения уведомлений */}
      {notification.visible && (
        <div className="notification">
          {notification.message}
        </div>
      )}

      {/* Секция для ввода новой задачи */}
      <div className="todo-input-section">
        <Input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
          className="todo-input"
        />
        {/* Кнопка "Добавить" с type="button" для предотвращения перезагрузки страницы */}
        <Button onClick={handleAddTodo} className="add-todo-button" type="button">
          Добавить
        </Button>
      </div>

      {/* Блок с кнопками фильтрации */}
      <div className="filter-buttons">
        <Button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'filter-button active' : 'filter-button'}
          type="button" // Всегда используем type="button" для кнопок, не являющихся submit
        >
          Все
        </Button>
        <Button
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'filter-button active' : 'filter-button'}
          type="button"
        >
          Активные
        </Button>
        <Button
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'filter-button active' : 'filter-button'}
          type="button"
        >
          Выполненные
        </Button>
      </div>

      {/* Кнопка очистки завершенных задач */}
      {todos.length > 0 && ( // Отображаем кнопку только если есть хотя бы одна задача
        <div className="clear-completed-section">
          <Button onClick={handleClearCompleted} className="clear-completed-button" type="button">
            Очистить завершенные
          </Button>
        </div>
      )}

      {/* Список задач */}
      <ul className="todo-list">
        {/* Отображение сообщений в зависимости от фильтра и количества задач */}
        {filteredTodos.length === 0 && filter === 'all' ? (
          <p className="no-todos">Задач пока нет. Добавьте первую!</p>
        ) : filteredTodos.length === 0 && filter === 'active' ? (
          <p className="no-todos">Активных задач пока нет.</p>
        ) : filteredTodos.length === 0 && filter === 'completed' ? (
          <p className="no-todos">Выполненных задач пока нет.</p>
        ) : (
          // Отображение отфильтрованных задач
          filteredTodos.map(todo => (
            <li
              key={todo.id}
              id={`todo-item-${todo.id}`} // Важно: добавляем ID для работы анимации удаления
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo.id)}
              />
              {editingTodoId === todo.id ? (
                // Режим редактирования
                <>
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(todo.id);
                    }}
                    className="editing-input"
                  />
                  <Button onClick={() => handleSaveEdit(todo.id)} className="save-edit-button" type="button">
                    Сохранить
                  </Button>
                  <Button onClick={handleCancelEdit} className="cancel-edit-button" type="button">
                    Отмена
                  </Button>
                </>
              ) : (
                // Обычный режим отображения
                <>
                  {/* Текст задачи, который является ссылкой на страницу деталей */}
                  <span className="todo-text" onDoubleClick={() => handleEditClick(todo)}>
                      <Link to={`/todo/${todo.id}`} className="todo-link">
                          {todo.text}
                      </Link>
                  </span>
                  {/* Кнопки "Редактировать" и "Удалить" */}
                  <Button onClick={() => handleEditClick(todo)} className="edit-todo-button" type="button">
                    Редактировать
                  </Button>
                  <Button onClick={() => handleDeleteTodo(todo.id)} className="delete-todo-button" type="button">
                    Удалить
                  </Button>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ToDoPage;
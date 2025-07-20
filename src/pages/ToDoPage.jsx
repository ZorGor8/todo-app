import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import './ToDoPage.css'; // Создадим этот файл стилей

const ToDoPage = () => {
  const [todos, setTodos] = useState([]); // Состояние для хранения списка задач
  const [newTodoText, setNewTodoText] = useState(''); // Состояние для текста нового todo

  // Обработчик добавления новой задачи
  const handleAddTodo = () => {
    if (newTodoText.trim() === '') return; // Не добавляем пустые задачи

    const newTodo = {
      id: Date.now(), // Простой уникальный ID
      text: newTodoText,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText(''); // Очищаем поле ввода
  };

  // Обработчик переключения статуса задачи (выполнена/не выполнена)
  const handleToggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Обработчик удаления задачи
  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-container">
      <h1>Мой Список Дел</h1>

      <div className="todo-input-section">
        <Input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
          className="todo-input"
        />
        <Button onClick={handleAddTodo} className="add-todo-button">
          Добавить
        </Button>
      </div>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <p className="no-todos">Задач пока нет. Добавьте первую!</p>
        ) : (
          todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo.id)}
              />
              <span className="todo-text">{todo.text}</span>
              <Button onClick={() => handleDeleteTodo(todo.id)} className="delete-todo-button">
                Удалить
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ToDoPage;
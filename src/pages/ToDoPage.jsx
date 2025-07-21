import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import './ToDoPage.css';

const ToDoPage = () => {
  // --- Начало блока состояний ---
  const [todos, setTodos] = useState([]); // Состояние для хранения списка задач
  const [newTodoText, setNewTodoText] = useState(''); // Состояние для текста нового todo
  const [editingTodoId, setEditingTodoId] = useState(null); // ID задачи, которая сейчас редактируется
  const [editingText, setEditingText] = useState(''); // Текст задачи во время редактирования
  // --- Конец блока состояний ---


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

  // --- Начало новых функций для редактирования ---
  const handleEditClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const handleSaveEdit = (id) => {
    if (editingText.trim() === '') {
      handleDeleteTodo(id); // Опционально: если текст пустой, удаляем задачу
      return;
    }
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editingText } : todo
    ));
    setEditingTodoId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingText('');
  };
  // --- Конец новых функций для редактирования ---


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
              {editingTodoId === todo.id ? (
                // Режим редактирования
                <>
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)} // Здесь используем setEditingText
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(todo.id);
                    }}
                    className="editing-input"
                  />
                  <Button onClick={() => handleSaveEdit(todo.id)} className="save-edit-button">
                    Сохранить
                  </Button>
                  <Button onClick={handleCancelEdit} className="cancel-edit-button">
                    Отмена
                  </Button>
                </>
              ) : (
                // Обычный режим отображения
                <>
                  <span className="todo-text" onDoubleClick={() => handleEditClick(todo)}>
                    {todo.text}
                  </span>
                  <Button onClick={() => handleEditClick(todo)} className="edit-todo-button">
                    Редактировать
                  </Button>
                  <Button onClick={() => handleDeleteTodo(todo.id)} className="delete-todo-button">
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
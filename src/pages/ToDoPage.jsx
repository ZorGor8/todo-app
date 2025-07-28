import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import './ToDoPage.css';
import { Link } from 'react-router-dom';

// Импортируем необходимые компоненты из @dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove, // Утилита для перемещения элементов в массиве
  verticalListSortingStrategy, // Стратегия для вертикальной сортировки
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'; // Для трансформаций CSS

// --- Компонент SortableItem для каждого элемента списка ---
const SortableItem = ({ todo, handleToggleComplete, handleDeleteTodo, handleEditClick, editingTodoId, editingText, handleSaveEdit, handleCancelEdit, handleToggleFavorite }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
    boxShadow: isDragging ? '0 8px 15px rgba(0, 0, 0, 0.2)' : '0 2px 8px var(--todo-item-shadow)',
  };

  return (
    <li
      ref={setNodeRef} // Привязываем ссылку на DOM-элемент для @dnd-kit
      style={style} // Применяем стили трансформации и перехода
      id={`todo-item-${todo.id}`} // Важно: сохраняем ID для анимации удаления
      className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.isFavorite ? 'favorite' : ''}`} // Добавляем класс 'favorite'
      data-dragging={isDragging ? "true" : "false"}
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
          <span className="todo-text" onDoubleClick={() => handleEditClick(todo)}>
              <Link to={`/todo/${todo.id}`} className="todo-link">
                  {todo.text}
              </Link>
          </span>
          <button
            onClick={() => handleToggleFavorite(todo.id)} // Обработчик переключения избранного
            className={`favorite-button ${todo.isFavorite ? 'active' : ''}`} // Динамический класс
            type="button"
          >
            ⭐ {/* Звездочка для избранного */}
          </button>
          <div className="drag-handle" {...attributes} {...listeners}>
            <span className="drag-dots">⋮</span> {/* Визуальный индикатор */}
          </div>
          <Button onClick={() => handleEditClick(todo)} className="edit-todo-button" type="button">
            Редактировать
          </Button>
          <Button onClick={() => handleDeleteTodo(todo.id)} className="delete-todo-button" type="button">
            Удалить
          </Button>
        </>
      )}
    </li>
  );
};


const ToDoPage = () => {
  const [todos, setTodos] = useState(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      const parsedTodos = storedTodos ? JSON.parse(storedTodos) : [];
      return parsedTodos.map(todo => ({ ...todo, isFavorite: todo.isFavorite ?? false }));
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
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поискового запроса

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 2000);
  };

  const handleAddTodo = () => {
    if (newTodoText.trim() === '') return;

    const newTodo = {
      id: Date.now(),
      text: newTodoText,
      completed: false,
      isFavorite: false,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText('');
    showNotification('Задача добавлена!');
  };

  const handleToggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (idToDelete) => {
      const todoToDeleteElement = document.getElementById(`todo-item-${idToDelete}`);

      if (todoToDeleteElement) {
          todoToDeleteElement.classList.add('fade-out');

          setTimeout(() => {
              setTodos(todos.filter(todo => todo.id !== idToDelete));
              showNotification('Задача удалена!');
          }, 300);
      } else {
          setTodos(todos.filter(todo => todo.id !== idToDelete));
          showNotification('Задача удалена!');
      }
  };

  const handleEditClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const handleSaveEdit = (id) => {
    if (editingText.trim() === '') {
      handleDeleteTodo(id);
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

  const handleClearCompleted = () => {
    const activeTodos = todos.filter(todo => !todo.completed);
    setTodos(activeTodos);
    if (todos.length > activeTodos.length) {
      showNotification('Выполненные задачи очищены!');
    }
  };

  const handleToggleFavorite = (id) => {
    setTodos(prevTodos => {
      if (!Array.isArray(prevTodos)) {
        console.error("prevTodos is not an array:", prevTodos);
        return [];
      }

      const updatedTodos = prevTodos.map(todo => {
        if (todo.id === id) {
          const newIsFavorite = !todo.isFavorite;
          const message = newIsFavorite ? 'Добавлено в избранное!' : 'Удалено из избранного!';
          showNotification(message);
          return { ...todo, isFavorite: newIsFavorite };
        }
        return todo;
      });
      return updatedTodos;
    });
  };

  // --- НОВАЯ ФУНКЦИЯ: Очистка поискового запроса ---
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  // --- КОНЕЦ НОВОЙ ФУНКЦИИ ---

  // Логика фильтрации и поиска
  const filteredAndSearchedTodos = todos.filter(todo => {
    let matchesFilter = true;
    if (filter === 'active') {
      matchesFilter = !todo.completed;
    } else if (filter === 'completed') {
      matchesFilter = todo.completed;
    } else if (filter === 'favorites') {
      matchesFilter = todo.isFavorite;
    }

    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  function handleDragEnd(event) {
    const {active, over} = event;

    setIsDraggingOver(false);

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }


  return (
    <div className="todo-container">
      <h1>Мой Список Дел</h1>

      {notification.visible && (
        <div className="notification">
          {notification.message}
        </div>
      )}

      <div className="todo-input-section">
        <Input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
          className="todo-input"
        />
        <Button onClick={handleAddTodo} className="add-todo-button" type="button">
          Добавить
        </Button>
      </div>

      {/* --- ОБНОВЛЕННАЯ Секция поиска с кнопкой очистки --- */}
      <div className="search-section">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск задач..."
          className="search-input"
        />
        {searchTerm && ( // Показываем кнопку только если есть текст в поиске
          <Button onClick={handleClearSearch} className="clear-search-button" type="button">
            Очистить поиск
          </Button>
        )}
      </div>
      {/* --- КОНЕЦ ОБНОВЛЕННОЙ СЕКЦИИ ПОИСКА --- */}

      <div className="filter-buttons">
        <Button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'filter-button active' : 'filter-button'}
          type="button"
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
        <Button
          onClick={() => setFilter('favorites')}
          className={filter === 'favorites' ? 'filter-button active' : 'filter-button'}
          type="button"
        >
          Избранное ⭐
        </Button>
      </div>

      {todos.length > 0 && (
        <div className="clear-completed-section">
          <Button onClick={handleClearCompleted} className="clear-completed-button" type="button">
            Очистить завершенные
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={() => setIsDraggingOver(true)}
        onDragCancel={() => setIsDraggingOver(false)}
      >
        <SortableContext
          items={filteredAndSearchedTodos.map(todo => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul
            className="todo-list"
            data-drop-active={isDraggingOver ? "true" : "false"}
          >
            {filteredAndSearchedTodos.length === 0 ? (
              searchTerm === '' && filter === 'all' ? (
                <p className="no-todos">Задач пока нет. Добавьте первую!</p>
              ) : searchTerm !== '' ? (
                <p className="no-todos">По запросу "{searchTerm}" ничего не найдено.</p>
              ) : filter === 'active' ? (
                <p className="no-todos">Активных задач пока нет.</p>
              ) : filter === 'completed' ? (
                <p className="no-todos">Выполненных задач пока нет.</p>
              ) : filter === 'favorites' ? (
                <p className="no-todos">Избранных задач пока нет.</p>
              ) : null
            ) : (
              filteredAndSearchedTodos.map(todo => (
                <SortableItem
                  key={todo.id}
                  todo={todo}
                  handleToggleComplete={handleToggleComplete}
                  handleDeleteTodo={handleDeleteTodo}
                  handleEditClick={handleEditClick}
                  editingTodoId={editingTodoId}
                  editingText={editingText}
                  handleSaveEdit={handleSaveEdit}
                  handleCancelEdit={handleCancelEdit}
                  handleToggleFavorite={handleToggleFavorite}
                />
              ))
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ToDoPage;

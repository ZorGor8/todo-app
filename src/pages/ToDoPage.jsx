import React, { useState, useEffect } from 'react';
// Импортируем компоненты Input и Button, которые уже есть
import Input from '../components/Input';
import Button from '../components/Button';
// Импортируем новые рефакторинговые компоненты
import Notification from '../components/Notification';
import FilterButtons from '../components/FilterButtons';
import LoadingSpinner from '../components/LoadingSpinner';

import './ToDoPage.css'; // Стили остаются здесь, так как они общие для страницы и её подкомпонентов
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
const SortableItem = ({ todo, handleToggleComplete, handleDeleteTodo, handleEditClick, editingTodoId, editingText, handleSaveEdit, handleCancelEdit, handleToggleFavorite, setEditingText }) => {
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
  const [todos, setTodos] = useState([]); // Инициализируем пустым массивом
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [filter, setFilter] = useState('all');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Имитация загрузки из localStorage
    setIsLoading(true); // Начинаем загрузку
    setTimeout(() => {
      try {
        const storedTodos = localStorage.getItem('todos');
        const parsedTodos = storedTodos ? JSON.parse(storedTodos) : [];
        setTodos(parsedTodos.map(todo => ({ ...todo, isFavorite: todo.isFavorite ?? false })));
      } catch (error) {
        console.error("Failed to load todos from localStorage", error);
        setTodos([]);
      } finally {
        setIsLoading(false); // Завершаем загрузку
      }
    }, 500); // Имитация задержки в 500мс
  }, []);

  useEffect(() => {
    // Сохраняем в localStorage только когда isLoading завершился
    if (!isLoading) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isLoading]); // Добавляем isLoading в зависимости

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 2000);
  };

  const handleAddTodo = () => {
    if (newTodoText.trim() === '') return;

    setIsLoading(true); // Начинаем загрузку
    setTimeout(() => {
      const newTodo = {
        id: Date.now(),
        text: newTodoText,
        completed: false,
        isFavorite: false,
      };
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodoText('');
      showNotification('Задача добавлена!');
      setIsLoading(false); // Завершаем загрузку
    }, 300); // Имитация задержки
  };

  const handleToggleComplete = (id) => {
    setIsLoading(true); // Начинаем загрузку
    setTimeout(() => {
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
      setIsLoading(false); // Завершаем загрузку
    }, 150); // Имитация задержки
  };

  const handleDeleteTodo = (idToDelete) => {
      const todoToDeleteElement = document.getElementById(`todo-item-${idToDelete}`);

      setIsLoading(true); // Начинаем загрузку
      if (todoToDeleteElement) {
          todoToDeleteElement.classList.add('fade-out');

          setTimeout(() => {
              setTodos(prevTodos => prevTodos.filter(todo => todo.id !== idToDelete));
              showNotification('Задача удалена!');
              setIsLoading(false); // Завершаем загрузку
          }, 300); // Имитация задержки
      } else {
          setTimeout(() => {
              setTodos(prevTodos => prevTodos.filter(todo => todo.id !== idToDelete));
              showNotification('Задача удалена!');
              setIsLoading(false); // Завершаем загрузку
          }, 300); // Имитация задержки
      }
  };

  const handleEditClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const handleSaveEdit = (id) => {
    console.log("Saving todo with ID:", id, "New text (before update):", editingText);

    if (editingText.trim() === '') {
      handleDeleteTodo(id); // Удаляем, если текст пустой
      return;
    }
    setIsLoading(true); // Начинаем загрузку
    setTimeout(() => {
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === id ? { ...todo, text: editingText } : todo
      ));
      setEditingTodoId(null);
      setEditingText('');
      showNotification('Задача обновлена!');
      setIsLoading(false); // Завершаем загрузку
    }, 300); // Имитация задержки
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingText('');
  };

  const handleClearCompleted = () => {
    setIsLoading(true); // Начинаем загрузку
    setTimeout(() => {
      const activeTodos = todos.filter(todo => !todo.completed);
      if (todos.length > activeTodos.length) {
        setTodos(activeTodos);
        showNotification('Выполненные задачи очищены!');
      }
      setIsLoading(false); // Завершаем загрузку
    }, 300); // Имитация задержки
  };

  const handleToggleFavorite = (id) => {
    setIsLoading(true); // Начинаем загрузку
    setTimeout(() => {
      setTodos(prevTodos => {
        if (!Array.isArray(prevTodos)) {
          console.error("prevTodos is not an array:", prevTodos);
          setIsLoading(false); // Завершаем загрузку в случае ошибки
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
        setIsLoading(false); // Завершаем загрузку
        return updatedTodos;
      });
    }, 150); // Имитация задержки
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

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
      // Здесь не имитируем загрузку, так как DndContext уже управляет визуальным состоянием
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

      {/* Используем компонент Notification */}
      <Notification message={notification.message} visible={notification.visible} />

      <div className="todo-input-section">
        <Input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
          className="todo-input"
          disabled={isLoading}
        />
        <Button onClick={handleAddTodo} className="add-todo-button" type="button" disabled={isLoading}>
          Добавить
        </Button>
      </div>

      <div className="search-section">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск задач..."
          className="search-input"
          disabled={isLoading}
        />
        {searchTerm && (
          <Button onClick={handleClearSearch} className="clear-search-button" type="button" disabled={isLoading}>
            Очистить поиск
          </Button>
        )}
      </div>

      {/* Используем компонент FilterButtons */}
      <FilterButtons filter={filter} setFilter={setFilter} isLoading={isLoading} />

      {todos.length > 0 && (
        <div className="clear-completed-section">
          <Button onClick={handleClearCompleted} className="clear-completed-button" type="button" disabled={isLoading}>
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
            {/* Используем компонент LoadingSpinner */}
            {isLoading ? (
              <LoadingSpinner message="Загрузка задач..." />
            ) : (
              filteredAndSearchedTodos.length === 0 ? (
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
                    setEditingText={setEditingText}
                  />
                ))
              )
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ToDoPage;


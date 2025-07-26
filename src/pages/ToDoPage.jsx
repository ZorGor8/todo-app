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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'; // Для трансформаций CSS

// --- Новый компонент SortableItem для каждого элемента списка ---
// Этот компонент делает каждый li перетаскиваемым и сортируемым
const SortableItem = ({ todo, handleToggleComplete, handleDeleteTodo, handleEditClick, editingTodoId, editingText, handleSaveEdit, handleCancelEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Добавляем isDragging для стилизации
  } = useSortable({ id: todo.id }); // ID элемента должно быть уникальным

  // Стили для перетаскиваемого элемента, использующие трансформации CSS
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Уменьшаем прозрачность при перетаскивании
    zIndex: isDragging ? 100 : 'auto', // Поднимаем элемент выше при перетаскивании
    boxShadow: isDragging ? '0 8px 15px rgba(0, 0, 0, 0.2)' : '0 2px 8px var(--todo-item-shadow)', // Тень при перетаскивании
    // Курсор для всего элемента теперь будет default, а для ручки - grab
  };

  return (
    <li
      ref={setNodeRef} // Привязываем ссылку на DOM-элемент для @dnd-kit
      style={style} // Применяем стили трансформации и перехода
      id={`todo-item-${todo.id}`} // Важно: сохраняем ID для анимации удаления
      className={`todo-item ${todo.completed ? 'completed' : ''}`}
      data-dragging={isDragging ? "true" : "false"} // Добавляем атрибут для CSS-стилизации активного перетаскивания
      // attributes и listeners теперь будут на drag handle, а не на li
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
          {/* Link теперь обычная ссылка для навигации.
              Перетаскивание будет начинаться только после движения мыши на 5px. */}
          <span className="todo-text" onDoubleClick={() => handleEditClick(todo)}>
              <Link to={`/todo/${todo.id}`} className="todo-link">
                  {todo.text}
              </Link>
          </span>
          {/* --- НОВЫЙ ЭЛЕМЕНТ: Drag Handle --- */}
          <div className="drag-handle" {...attributes} {...listeners}>
            <span className="drag-dots">⋮</span> {/* Визуальный индикатор */}
          </div>
          {/* --- КОНЕЦ НОВОГО ЭЛЕМЕНТА --- */}
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
// --- Конец SortableItem ---


const ToDoPage = () => {
  // Инициализация состояния todos из localStorage.
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
  // Новое состояние для отслеживания, активно ли перетаскивание над списком
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Настраиваем сенсоры для DndContext (pointer для мыши, keyboard для клавиатуры)
  // Убираем activationConstraint от PointerSensor, так как теперь есть drag handle
  const sensors = useSensors(
    useSensor(PointerSensor), // PointerSensor теперь без activationConstraint
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  // useEffect для СОХРАНЕНИЯ в localStorage.
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

  // Функции для редактирования
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

  // Обработчик для удаления всех выполненных задач
  const handleClearCompleted = () => {
    const activeTodos = todos.filter(todo => !todo.completed);
    setTodos(activeTodos);
    if (todos.length > activeTodos.length) {
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
    return true;
  });

  // --- Обработчик завершения перетаскивания для @dnd-kit ---
  function handleDragEnd(event) {
    const {active, over} = event;

    // Сбрасываем состояние isDraggingOver
    setIsDraggingOver(false);

    if (active.id !== over.id) {
      setTodos((items) => {
        // Находим старый и новый индексы элементов
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        // arrayMove - утилита из @dnd-kit/sortable для переупорядочивания массива
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
      </div>

      {todos.length > 0 && (
        <div className="clear-completed-section">
          <Button onClick={handleClearCompleted} className="clear-completed-button" type="button">
            Очистить завершенные
          </Button>
        </div>
      )}

      {/* --- DndContext для включения перетаскивания с @dnd-kit --- */}
      <DndContext
        sensors={sensors} // Привязываем сенсоры (мышь, клавиатура)
        collisionDetection={closestCenter} // Стратегия определения столкновений элементов
        onDragEnd={handleDragEnd} // Обработчик завершения перетаскивания
        onDragStart={() => setIsDraggingOver(true)} // Устанавливаем true при начале перетаскивания
        onDragCancel={() => setIsDraggingOver(false)} // Устанавливаем false при отмене перетаскивания
      >
        {/* SortableContext: предоставляет контекст для сортируемых элементов */}
        {/* items: массив ID элементов, которые можно сортировать */}
        <SortableContext
          items={filteredTodos.map(todo => todo.id)} // Передаем ID отфильтрованных задач
          strategy={null} // Можно использовать defaultAnimateLayoutChanges или другие стратегии
        >
          <ul
            className="todo-list"
            data-drop-active={isDraggingOver ? "true" : "false"} // Добавляем атрибут для CSS-стилизации области бросания
          >
            {filteredTodos.length === 0 && filter === 'all' ? (
              <p className="no-todos">Задач пока нет. Добавьте первую!</p>
            ) : filteredTodos.length === 0 && filter === 'active' ? (
              <p className="no-todos">Активных задач пока нет.</p>
            ) : filteredTodos.length === 0 && filter === 'completed' ? (
              <p className="no-todos">Выполненных задач пока нет.</p>
            ) : (
              // Отображаем каждый элемент как SortableItem
              filteredTodos.map(todo => (
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

import React from 'react';
import Button from './Button'; // Импортируем компонент Button

const FilterButtons = ({ filter, setFilter, isLoading }) => {
  return (
    <div className="filter-buttons">
      <Button
        onClick={() => setFilter('all')}
        className={filter === 'all' ? 'filter-button active' : 'filter-button'}
        type="button"
        disabled={isLoading}
      >
        Все
      </Button>
      <Button
        onClick={() => setFilter('active')}
        className={filter === 'active' ? 'filter-button active' : 'filter-button'}
        type="button"
        disabled={isLoading}
      >
        Активные
      </Button>
      <Button
        onClick={() => setFilter('completed')}
        className={filter === 'completed' ? 'filter-button active' : 'filter-button'}
        type="button"
        disabled={isLoading}
      >
        Выполненные
      </Button>
      <Button
        onClick={() => setFilter('favorites')}
        className={filter === 'favorites' ? 'filter-button active' : 'filter-button'}
        type="button"
        disabled={isLoading}
      >
        Избранное ⭐
      </Button>
    </div>
  );
};

export default FilterButtons;

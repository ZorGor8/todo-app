import React from 'react';
import ToDoPage from './pages/ToDoPage';
import './App.css'; // Оставим App.css для общих стилей, если нужны

function App() {
  return (
    <div className="App">
      <ToDoPage />
    </div>
  );
}

export default App;
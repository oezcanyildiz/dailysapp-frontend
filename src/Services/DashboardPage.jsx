import React, { useState, useEffect } from 'react';
import TodoDetailModal from './TodoDetailModal';
import './Dashboard.css';

const DashboardPage = () => {
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch today's todos on component mount
  useEffect(() => {
    fetchTodayTodos();
  }, []);

  const fetchTodayTodos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:8080/todo/mydailys/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Todos');
      }

      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTodoClick = (todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleToggleDone = async (todoId, e) => {
    e.stopPropagation(); // Verhindert, dass das Modal öffnet
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:8080/todo/toggle/${todoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren');
      }

      const updatedTodo = await response.json();
      
      // Update local state
      setTodos(todos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleTodoUpdate = (updatedTodo) => {
    setTodos(todos.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
    setIsModalOpen(false);
  };

  const handleTodoDelete = (deletedTodoId) => {
    setTodos(todos.filter(todo => todo.id !== deletedTodoId));
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:mm
  };

  const getTodayDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('de-DE', options);
  };

  const completedCount = todos.filter(todo => todo.done).length;
  const totalCount = todos.length;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Lade deine Todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">Daily<span className="accent">Flow</span></h1>
            <p className="today-date">{getTodayDate()}</p>
          </div>
          <div className="header-right">
            <div className="progress-indicator">
              <span className="progress-text">{completedCount} / {totalCount}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {todos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>Keine Todos für heute</h2>
            <p>Genieße deinen freien Tag oder erstelle ein neues Todo!</p>
          </div>
        ) : (
          <div className="todos-grid">
            {todos.map((todo, index) => (
              <div
                key={todo.id}
                className={`todo-card ${todo.done ? 'done' : ''}`}
                onClick={() => handleTodoClick(todo)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="todo-card-header">
                  <button
                    className={`checkbox ${todo.done ? 'checked' : ''}`}
                    onClick={(e) => handleToggleDone(todo.id, e)}
                    aria-label="Toggle erledigt"
                  >
                    {todo.done && <span className="checkmark">✓</span>}
                  </button>
                  {todo.dueTime && (
                    <span className="todo-time">{formatTime(todo.dueTime)}</span>
                  )}
                </div>
                
                <h3 className="todo-title">{todo.title}</h3>
                
                {todo.description && (
                  <p className="todo-description">{todo.description}</p>
                )}
                
                <div className="todo-footer">
                  <span className="edit-hint">Klicken zum Bearbeiten</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleTodoUpdate}
          onDelete={handleTodoDelete}
        />
      )}
    </div>
  );
};

export default DashboardPage;

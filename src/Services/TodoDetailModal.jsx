import React, { useState } from 'react';
import './TodoDetailModal.css';

const TodoDetailModal = ({ todo, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: todo.title,
    description: todo.description || '',
    dueTime: todo.dueTime || '',
    done: todo.done
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Titel darf nicht leer sein');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:8080/todo/update/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren');
      }

      const updatedTodo = await response.json();
      onUpdate(updatedTodo);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Möchtest du dieses Todo wirklich löschen?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:8080/todo/delete/${todo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen');
      }

      onDelete(todo.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleToggleDone = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:8080/todo/toggle/${todo.id}`, {
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
      onUpdate(updatedTodo);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Keine Zeit festgelegt';
    return timeString.substring(0, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Schließen">
          ×
        </button>

        {error && (
          <div className="modal-error">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {!isEditing ? (
          // View Mode
          <div className="modal-view">
            <div className="modal-header">
              <div className="status-badge-container">
                <button 
                  className={`status-badge ${todo.done ? 'done' : 'pending'}`}
                  onClick={handleToggleDone}
                >
                  {todo.done ? '✓ Erledigt' : '○ Offen'}
                </button>
              </div>
              <h2 className="modal-title">{todo.title}</h2>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <div className="info-item">
                  <span className="info-label">Datum</span>
                  <span className="info-value">{formatDate(todo.date)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Uhrzeit</span>
                  <span className="info-value">{formatTime(todo.dueTime)}</span>
                </div>
              </div>

              {todo.description && (
                <div className="description-section">
                  <h3 className="section-title">Beschreibung</h3>
                  <p className="description-text">{todo.description}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Bearbeiten
              </button>
              <button 
                className="btn-delete"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Wird gelöscht...' : 'Löschen'}
              </button>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="modal-edit">
            <h2 className="modal-title">Todo bearbeiten</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title" className="form-label">Titel *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="z.B. Meeting vorbereiten"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Beschreibung</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Zusätzliche Details..."
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dueTime" className="form-label">Uhrzeit</label>
                  <input
                    type="time"
                    id="dueTime"
                    name="dueTime"
                    className="form-input"
                    value={formData.dueTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="done"
                      checked={formData.done}
                      onChange={handleChange}
                      className="form-checkbox"
                    />
                    <span>Als erledigt markieren</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      title: todo.title,
                      description: todo.description || '',
                      dueTime: todo.dueTime || '',
                      done: todo.done
                    });
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? 'Wird gespeichert...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoDetailModal;

import React from 'react';

const TodoItem = ({ todo, onDelete, onToggle }) => {
    const isDone = todo.done;

    return (
        <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            position: 'relative',
            opacity: isDone ? 0.7 : 1,
            transition: 'all 0.3s ease',
            borderLeft: `4px solid ${isDone ? 'var(--success)' : 'var(--primary)'}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    textDecoration: isDone ? 'line-through' : 'none',
                    color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)'
                }}>
                    {todo.title}
                </h3>
                <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => onToggle(todo.id, todo.done)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
            </div>

            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                marginBottom: '1rem',
                textDecoration: isDone ? 'line-through' : 'none'
            }}>
                {todo.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>
                    {todo.date && <span>📅 {todo.date}</span>}
                    {todo.dueTime && <span style={{ marginLeft: '0.5rem' }}>⏰ {todo.dueTime}</span>}
                </div>

                <button
                    onClick={() => onDelete(todo.id)}
                    className="btn-danger"
                    title="Löschen"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

export default TodoItem;

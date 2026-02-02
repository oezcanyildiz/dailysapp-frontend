import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, onDelete, onToggle }) => {
    if (!todos || todos.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }} className="glass">
                <h3>Keine Daily's gefunden</h3>
                <p>Erstelle dein erstes Daily um produktiv zu starten!</p>
            </div>
        );
    }

    // Sort: Not done first, then by date/time
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1;
    });

    return (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {sortedTodos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={onDelete}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
};

export default TodoList;

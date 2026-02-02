import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoList from './TodoList';
import AddTodo from './AddTodo';
import { getTodosByDate, createTodo, deleteTodo, toggleTodoStatus } from '../Services/todoService';
import { logout, getCurrentUser } from '../Services/authService';

const DashboardPage = () => {
    const [todos, setTodos] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Helper to get local date string YYYY-MM-DD
    const getLocalDateString = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const todayObj = new Date();
    const [selectedDate, setSelectedDate] = useState(getLocalDateString(todayObj));
    const [weekDates, setWeekDates] = useState([]);

    const user = getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Generate 7 days centered on TODAY (not selected date, per request "today in middle")
        const dates = [];
        for (let i = -3; i <= 3; i++) {
            const d = new Date(todayObj);
            d.setDate(todayObj.getDate() + i);
            dates.push({
                dateObj: d,
                dateString: getLocalDateString(d),
                dayName: d.toLocaleDateString('de-DE', { weekday: 'short' }),
                dayNum: d.getDate()
            });
        }
        setWeekDates(dates);
    }, []);

    useEffect(() => {
        loadTodos(selectedDate);
    }, [selectedDate]);

    const loadTodos = async (date) => {
        try {
            const data = await getTodosByDate(date);
            setTodos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading todos:', error);
        }
    };

    const handleCreateTodo = async (todoData) => {
        try {
            await createTodo(todoData.title, todoData.description, todoData.date, todoData.dueTime);
            // Refresh only if we are on the date where we created the todo
            if (todoData.date === selectedDate) {
                await loadTodos(selectedDate);
            }
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error creating todo:', error);
            alert('Fehler beim Erstellen des Todos');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Möchten Sie dieses Todo wirklich löschen?')) {
            try {
                await deleteTodo(id);
                setTodos(todos.filter(t => t.id !== id));
            } catch (error) {
                console.error('Error deleting todo:', error);
            }
        }
    };

    const handleToggle = async (id, currentDoneStatus) => {
        try {
            await toggleTodoStatus(id, currentDoneStatus);
            setTodos(todos.map(t =>
                t.id === id ? { ...t, done: !currentDoneStatus } : t
            ));
        } catch (error) {
            console.error('Error toggling status:', error);
            loadTodos(selectedDate);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header glass" style={{ padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Hallo, {user?.name || 'Benutzer'}</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>Deine Daily's für <span style={{ fontWeight: 'bold' }}>{new Date(selectedDate).toLocaleDateString('de-DE')}</span></p>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary">
                        Abmelden
                    </button>
                </div>

                {/* Date Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {weekDates.map((day) => {
                        const isSelected = day.dateString === selectedDate;
                        const isToday = day.dateString === getLocalDateString(new Date());
                        return (
                            <div
                                key={day.dateString}
                                onClick={() => setSelectedDate(day.dateString)}
                                className={isSelected ? 'glass' : ''}
                                style={{
                                    flex: 1,
                                    minWidth: '60px',
                                    textAlign: 'center',
                                    padding: '0.8rem 0.2rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? 'rgba(255,255,255, 0.2)' : 'rgba(255,255,255, 0.05)',
                                    border: isSelected ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                                    transition: 'all 0.2s',
                                    opacity: isSelected ? 1 : 0.7
                                }}
                            >
                                <div style={{ fontSize: '0.8rem', marginBottom: '0.2rem', fontWeight: isToday ? 'bold' : 'normal', color: isToday ? 'var(--primary)' : 'inherit' }}>
                                    {isToday ? 'Heute' : day.dayName}
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {day.dayNum}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </header>

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                    + Neues Daily
                </button>
            </div>

            <TodoList
                todos={todos}
                onDelete={handleDelete}
                onToggle={handleToggle}
            />

            {isAddModalOpen && (
                <AddTodo
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleCreateTodo}
                />
            )}
        </div>
    );
};

export default DashboardPage;

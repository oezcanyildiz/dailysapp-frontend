const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/todo';

// Holt Token für Authorization Header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Alle Todos für HEUTE holen
export const getTodos = async () => {
  // Standardmäßig Heute laden
  const today = new Date().toISOString().split('T')[0];
  return getTodosByDate(today);
};

// Alle Todos für ein bestimmtes Datum holen
export const getTodosByDate = async (date) => {
  const response = await fetch(`${API_URL}/mydailys/date/${date}`, {
    method: 'GET',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Todos konnten nicht geladen werden');
  }

  return await response.json();
};

// Neues Todo erstellen
export const createTodo = async (title, description, date, dueTime) => {
  const response = await fetch(`${API_URL}/create`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({
      title,
      description,
      date,
      dueTime,
      done: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Todo konnte nicht erstellt werden');
  }

  return await response.json();
};

// Todo aktualisieren
export const updateTodo = async (id, todoData) => {
  const response = await fetch(`${API_URL}/update/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(todoData),
  });

  if (!response.ok) {
    throw new Error('Todo konnte nicht aktualisiert werden');
  }

  return await response.json();
};

// Todo löschen
export const deleteTodo = async (id) => {
  const response = await fetch(`${API_URL}/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Todo konnte nicht gelöscht werden');
  }

  return true;
};

// Todo Status ändern (done: true/false) -> Backend hat /toggle/{id}
export const toggleTodoStatus = async (id, currentDoneStatus) => {
  const response = await fetch(`${API_URL}/toggle/${id}`, {
    method: 'PUT', // Controller uses PUT for toggle
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Todo Status konnte nicht geändert werden');
  }

  return await response.json();
};

// Ein einzelnes Todo holen (Backend hat das nicht explizit in der Liste, wir nutzen getTodos)
export const getTodoById = async (id) => {
  // Not implemented in backend controller
  return null;
};

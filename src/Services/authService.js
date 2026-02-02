const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/auth';

// Login - Sendet Daten an Backend
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userEmail: email,       // Backend erwartet userEmail
      userPassword: password  // Backend erwartet userPassword
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Login Error:', response.status, errorText);
    throw new Error(`Login fehlgeschlagen: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  // Token speichern (falls Backend ein JWT zurückgibt)
  if (data.token) {
    localStorage.setItem('token', data.token);
    // Backend liefert flaches JSON, wir speichern es als User-Objekt
    const userObj = {
      name: data.userName,
      email: data.userEmail
    };
    localStorage.setItem('user', JSON.stringify(userObj));
  }

  return data;
};

// Register - Sendet Registrierungsdaten an Backend
export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/save`, { // Endpoint ist /save, nicht /register
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userName: name,         // Backend erwartet userName
      userEmail: email,       // Backend erwartet userEmail
      userPassword: password  // Backend erwartet userPassword
    }),
  });

  if (!response.ok) {
    throw new Error('Registrierung fehlgeschlagen');
  }

  return await response.json();
};

// Logout - Löscht Token und User-Daten
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Gibt aktuellen Token zurück
export const getToken = () => {
  return localStorage.getItem('token');
};

// Gibt aktuellen User zurück
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Prüft ob User eingeloggt ist
export const isAuthenticated = () => {
  return getToken() !== null;
};
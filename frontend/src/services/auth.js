/**
 * NewsShield_AI - Frontend Authentication Client
 * Connects to Supabase Auth REST endpoints using public anonymous key.
 * Manages user session, JWT storage in localStorage, and state change listeners.
 * Complies with PRD Section 8 & Section 21.1.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jzuaqzhijqczhkqauosc.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const SESSION_KEY = 'newsshield_auth_session';
const listeners = new Set();

function notifyListeners(user) {
  listeners.forEach(fn => fn(user));
}

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredSession(session) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {}
}

export const authService = {
  getCurrentUser() {
    const session = getStoredSession();
    return session ? session.user : null;
  },

  getAccessToken() {
    const session = getStoredSession();
    return session ? session.access_token : null;
  },

  onAuthStateChange(callback) {
    listeners.add(callback);
    callback(this.getCurrentUser());
    return () => listeners.delete(callback);
  },

  async signUp(email, password, fullName = '') {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        data: { name: fullName }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || data.message || 'Registration failed');
    }

    if (data.access_token) {
      setStoredSession(data);
      notifyListeners(data.user);
    }
    return data;
  },

  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || data.message || 'Invalid email or password');
    }

    setStoredSession(data);
    notifyListeners(data.user);
    return data;
  },

  async signOut() {
    const token = this.getAccessToken();
    if (token) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`
          }
        });
      } catch {}
    }
    setStoredSession(null);
    notifyListeners(null);
  }
};

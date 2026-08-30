import { useEffect, useState } from 'react';
import api from '../services/api';

export function saveSession(token) { window.localStorage.setItem('auth_token', token); }
export function clearSession() { window.localStorage.removeItem('auth_token'); }

export function useCurrentUser() {
  const [state, setState] = useState({ loading: true, user: null });
  useEffect(() => {
    if (!window.localStorage.getItem('auth_token')) {
      setState({ loading: false, user: null });
      return;
    }
    api.get('/auth/me')
      .then(({ data }) => setState({ loading: false, user: data.user }))
      .catch(() => { clearSession(); setState({ loading: false, user: null }); });
  }, []);
  return state;
}

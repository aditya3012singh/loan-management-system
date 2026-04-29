import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      Cookies.set('token', action.payload.token, { expires: 1 });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = Cookies.get('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
          try {
            state.user = JSON.parse(storedUser);
            state.token = token;
            state.isAuthenticated = true;
          } catch (e) {
            console.error('Failed to parse stored user', e);
          }
        }
      }
    },
  },
});

export const { setCredentials, logoutUser, initializeAuth } = authSlice.actions;

export default authSlice.reducer;

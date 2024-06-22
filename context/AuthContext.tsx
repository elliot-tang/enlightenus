import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface AuthContextData {
  token: string | undefined;
  user: string | undefined;
  loading: boolean | undefined;
  login: (username: string, password: string, keepSignedIn: boolean) => Promise<void>;
  register: (email: string, username: string, password: string, keepSignedIn: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

interface Props {
  children?: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children } : Props) => {
  const [user, setUser] = useState<string | undefined>(undefined);
  const [token, setToken] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | undefined>(true);

  // checks for token upon mount
  useEffect(() => {
    async function loadUser() {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const keepSignedIn = await AsyncStorage.getItem('keepSignedIn')
      if (token && user && (keepSignedIn === null || keepSignedIn === 'true')) {
        // TODO: implement decoding of token
        setToken(token);
        setUser(user);
      } else {
        AsyncStorage.removeItem('token');
        AsyncStorage.removeItem('user');
        AsyncStorage.removeItem('keepSignedIn');
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (username : string, password : string, keepSignedIn : boolean) => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/auth/login`, { username, password });
      const { token, user, message } = response.data;
      setToken(token);
      setUser(user);
      if (keepSignedIn) {
        await AsyncStorage.setItem('user', user);
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('keepSignedIn', String(keepSignedIn));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  const register = async (email : string, username : string, password : string, keepSignedIn : boolean) => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/auth/register`, { email, username, password });
      const { token, user, message } = response.data;
      console.log('User registered!');
      alert('Registration success!');
      setToken(token);
      setUser(user);
      if (keepSignedIn) {
        await AsyncStorage.setItem('user', user);
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('keepSignedIn', String(keepSignedIn));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  const logout = async () => {
    setToken(undefined);
    setUser(undefined);
    setLoading(true);
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('keepSignedIn');
  }

  const value = {user, token, loading, login, register, logout};
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const returnUser = () => {
  const data : AuthContextData = useContext(AuthContext);
  if (data.user) {
    return data.user;
  } else {
    throw new Error('returnUser must be used within an AuthContext');
  }
}

export const useAuth = () => useContext(AuthContext);
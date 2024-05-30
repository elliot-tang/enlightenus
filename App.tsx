import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/login';
import RegisterScreen from './screens/register';
import HomeScreen from './screens/home';
import { AuthProvider, useAuth } from './context/AuthContext';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
}

export type HomeStackParamList = {
  Home: undefined;
}

const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();

const AuthStack = () => (
  <AuthStackNav.Navigator 
  screenOptions={{
    headerShown: false,
  }}> 
    <AuthStackNav.Screen name='Login' component={LoginScreen} />
    <AuthStackNav.Screen name='Register' component={RegisterScreen} />
  </AuthStackNav.Navigator>
)

const HomeStack = () => (
  <HomeStackNav.Navigator
  screenOptions={{
    headerShown: false,
  }}> 
    <HomeStackNav.Screen name='Home' component={HomeScreen} />
  </HomeStackNav.Navigator>
)

const AuthNavigator = () => {
  const loggedIn = useAuth();
  const user = loggedIn.user;
  return user ? <HomeStack /> : <AuthStack />;
}

const App = () => (
  <AuthProvider>
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  </AuthProvider>
)

export default App;
import React from 'react';
import {createContext, useState} from "react"
import { NavigationContainer } from '@react-navigation/native';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/login';
import RegisterScreen from './screens/register';
import StartScreen from './screens/start';
import CreateScreen from './screens/create';
import ForumScreen from "./screens/forum";
import HistScreen from "./screens/history"
import LeaderboardScreen from './screens/leaderboard';
import PlayScreen from './screens/play';
import {QnProps} from './components/question1by1';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StyleSheet } from 'react-native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
}

export interface HomeScreenProps extends NativeStackScreenProps<StackNavigationParamList>{}

interface UnfinwithCall {
  data: Array<QnProps>
  setData: (newd: Array<QnProps>)=>void
}

export const UnfinishedQuizCreationData = createContext<UnfinwithCall>({
  data: [],
  setData: (newData) => {},
});

// Optional type definition for bottom tab navigator params
type BottomTabNavigationParamList = {
  Leaderboard: undefined;
  Forum: undefined;
  Home: undefined;
  History: undefined
};

export type StackNavigationParamList = {
  Home: undefined;
  Create: undefined;
  Play: undefined;
}

const Tab = createBottomTabNavigator<BottomTabNavigationParamList>(); /*I will keep the tab within this file, */
/*i think it better to keep the home screen naviagtion together with the rest, its not technically a screen anyway*/
export const Stack = createNativeStackNavigator<StackNavigationParamList>();

const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => (
  <AuthStackNav.Navigator 
  screenOptions={{
    headerShown: false,
  }}> 
    <AuthStackNav.Screen name='Login' component={LoginScreen} />
    <AuthStackNav.Screen name='Register' component={RegisterScreen} />
  </AuthStackNav.Navigator>
)

function HomeScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={StartScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Forum" component={ForumScreen} />
      <Tab.Screen name ="History" component={HistScreen}/>
    </Tab.Navigator>

  );
}

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="Create" component={CreateScreen} options={{ headerLeft: ()=> null}}/>
    <Stack.Screen name="Play" component={PlayScreen} />
  </Stack.Navigator>
)

const AuthNavigator = () => {
  const loggedIn = useAuth();
  const user = loggedIn.user;
  return user ? <HomeStack /> : <AuthStack />;
}

function App() {
const [unfin,setUnfin] = useState(Array<QnProps>);
  function childTrafficking(newData: Array<QnProps>) {
    setUnfin(newData);}
  return(
  <AuthProvider>
    <UnfinishedQuizCreationData.Provider value = {{data:unfin,setData:childTrafficking}}>
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    </UnfinishedQuizCreationData.Provider>
    </AuthProvider>
)}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  banner: {
    height: 123,
    width: 396,
  },

  headerContainer: {
    paddingTop: 30,
  },

  header: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  inputContainer: {
    paddingTop: 20,
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5
  },

  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 7
  },

  buttonContainer: {
    paddingTop: 20,
    gap: 10,
  },

  bottombuttonContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingTop: 20,
    gap: 10,
  },

  redirectContainer: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  link: {
    color: "blue",
  },

  pickerStyle: {
    height: 50, 
    fontSize: 15, 
    fontWeight: 'bold', 
  },

  imagecontainer: {
    width: 100, 
    height: 100, 
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#cdeeff', 
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', 
  },
  textContainer: {
    position: 'absolute',
    bottom: 0, 
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    padding: 5,
  },
  icon: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'black'
  }
})

export default App;
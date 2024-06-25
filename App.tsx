import React, { createContext, useState }from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen imports
import LoginScreen from './screens/auth/login';
import RegisterScreen from './screens/auth/register';
import HomeTabs from './screens/home/home_tabs/home_navigator';
import CreateScreen from './screens/home/create';
import PlayScreen from './screens/home/play';
import QuizScreen, { OneScreen, ScrollScreen } from './screens/home/quizscreen';
import { QnProps } from './components/question1by1';
import { QuizProps } from './components/quizcardonsearch';
import { AuthProvider, useAuth } from './context/AuthContext';

// Defines type parameters for route params
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
}

export type HomeStackParamList = {
  HomeTabs: undefined;
  Create: { topic: string };
  Play: { topic: string };
  DisplayPlay: {qzprop:QuizProps};
  ScrollScreen: {qzprop:QuizProps};
  OneScreen: {qzprop:QuizProps};
}

export interface HomeScreenProps extends NativeStackScreenProps<HomeStackParamList>{}

interface UnfinwithCall {
  data: Array<QnProps>
  setData: (newd: Array<QnProps>)=>void
  save: Array<String>
  setSaved: (newd: Array<String>)=>void
  mongo: Array<{localID: string, mongoID: string}>
  setMongo: (newd: Array<{localID: string, mongoID: string}>)=>void
}

export const UnfinishedQuizCreationData = createContext<UnfinwithCall>({
  data: [],
  setData: (newData) => {},
  save: [],
  setSaved: (newSaved) => {},
  mongo:[],
  setMongo: (newSaved) => {},
});

type BottomTabNavigationParamList = {
  Leaderboard: undefined;
  Forum: undefined;
  Home: undefined;
  History: undefined
};

const Tab = createBottomTabNavigator<BottomTabNavigationParamList>(); 
export const Stack = createNativeStackNavigator<HomeStackParamList>();

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

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }}/>
    <Stack.Screen name="Create" component={CreateScreen} options={{ headerShown: false}}/>
    <Stack.Screen name="Play" component={PlayScreen} />
    <Stack.Screen name="DisplayPlay" component={QuizScreen} />
    <Stack.Screen name="ScrollScreen" component={ScrollScreen} />
    <Stack.Screen name="OneScreen" component={OneScreen} />
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
  const [unfin2,setUnfin2] = useState(Array<String>);
  function childTrafficking2(newData: Array<String>) {
    setUnfin2(newData);
  }
  const [unfin3,setUnfin3] = useState(Array<{localID: string, mongoID: string}>);
  function childTrafficking3(newData: Array<{localID: string, mongoID: string}>) {
    setUnfin3(newData);
  }
  return(
  <AuthProvider>
    <UnfinishedQuizCreationData.Provider value = {{data:unfin,setData:childTrafficking, save: unfin2, setSaved:childTrafficking2, mongo: unfin3, setMongo:childTrafficking3}}>
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
    borderColor: 'black',
  }
})

export default App;
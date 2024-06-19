import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from '@app/App';
import StartScreen from './start';
import LeaderboardScreen from './leaderboard';
import ForumScreen from './forum';
import QuizHistoryScreen from './history';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeTabs'>;

export type HomeTabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Forum: undefined;
  QuizHistory: undefined;
}

const HomeTabNav = createBottomTabNavigator<HomeTabParamList>();

const HomeTabs : React.FC<Props> = () => (
  <HomeTabNav.Navigator>
    <HomeTabNav.Screen 
      name="Home" 
      component={StartScreen} 
      options={{
        headerShown: false,
        tabBarLabel: 'Home',
        tabBarIcon: () => (
          <MaterialIcons name="home" size={24} color="black" />
        ), 
      }}
    />
    <HomeTabNav.Screen 
      name="Leaderboard" 
      component={LeaderboardScreen} 
      options={{
        headerShown: false,
        tabBarLabel: 'Leaderboard',
        tabBarIcon: () => (
          <MaterialIcons name="leaderboard" size={24} color="black" />
        ), 
      }}
    />
    <HomeTabNav.Screen 
      name="Forum" 
      component={ForumScreen} 
      options={{
        headerShown: false, 
        tabBarLabel: 'Forum',
        tabBarIcon: () => (
          <MaterialIcons name="forum" size={24} color="black" />
        ), 
      }}
    />
    <HomeTabNav.Screen 
      name="QuizHistory" 
      component={QuizHistoryScreen} 
      options={{
        headerShown: false, 
        tabBarLabel: 'Quiz History',
        tabBarIcon: () => (
          <MaterialIcons name="history" size={24} color="black" />
        ), 
      }}
    />
  </HomeTabNav.Navigator>
)

export default HomeTabs;
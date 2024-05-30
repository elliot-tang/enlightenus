import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../App';
import { returnUser } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = () => {
  const user : string = returnUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  }
  
  return (
  <View style={styles.container}>
    <Text style = {styles.headerText}>
      Welcome, {user}!
    </Text>
    
    <View style={styles.buttonContainer}>
      <Button title="Logout" color='#6cac48' onPress={handleLogout} />
    </View>
  </View>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }, 

  headerText: {
    fontSize: 30,
  }, 
  
  buttonContainer: {
    paddingTop: 20,
  },
});

export default HomeScreen;
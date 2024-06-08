import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { returnUser } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { HomeScreenProps } from "../App"

function StartScreen({ navigation }: HomeScreenProps) {
  const user : string = returnUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  }
  
  return (
  <View style={styles.container}>
    <Text style = {styles.headerText}>
      Welcome back, {user}! What would you like to do today?
    </Text>
    
    <View style={styles.buttonContainer}>
      <Button title="Create New" onPress={() => navigation.navigate('Create')} />
      <Button title="Play Quiz" onPress={() => navigation.navigate('Play')} />
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

export default StartScreen;
import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { HomeTabParamList } from './home_navigator';
import { returnUser } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

type Props = BottomTabScreenProps<HomeTabParamList, 'Home'>;

const HomeScreen: React.FC<Props> = () => {
  const user : string = returnUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  }
  
  return (
  <View style={styles.container}>

    <Image style={styles.banner} source={require("../../assets/banner.png")}></Image>

    <View style={styles.header}>
      <Text style = {styles.headerText}>
        Welcome, {user}!
      </Text>
    </View>

    <View style={styles.textContainer}>
      <Text style = {styles.text}>
        What would you like to do today?
      </Text>
    </View>

    <View style={styles.buttonContainer}>
      <Button title="Logout" color='#6cac48' onPress={handleLogout} />
    </View>

  </View>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  banner: {
    height: 123,
    width: 396,
  },

  header: {
    paddingTop: 30,
  },

  headerText: {
    fontSize: 30,
  }, 

  textContainer: {
    paddingTop: 20,
  },

  text: {
    fontSize: 20,
  },
  
  buttonContainer: {
    paddingTop: 50,
  },
});

export default HomeScreen;
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { HomeTabParamList } from './home_navigator';

type Props = BottomTabScreenProps<HomeTabParamList, 'Leaderboard'>;

const QuizHistoryScreen: React.FC<Props> = () => {  
  return (
  <View style={styles.container}>
    <Text style = {styles.headerText}>
      Work in Progress!
    </Text>
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
});

export default QuizHistoryScreen;
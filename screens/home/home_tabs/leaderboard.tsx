import { StyleSheet, View, Text } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { HomeTabParamList } from './home_navigator';
import React from "react";

type Props = BottomTabScreenProps<HomeTabParamList, 'Leaderboard'>;

const LeaderboardScreen : React.FC<Props> = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text>Work in progress!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LeaderboardScreen;
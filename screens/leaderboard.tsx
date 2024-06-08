import {View,Text, Button} from "react-native"
import {styles, HomeScreenProps} from "../App"

export default function LeaderboardScreen({ navigation }: HomeScreenProps) {
    return (
      <View style={styles.container}>
        <Text>Leaderboard</Text>
        {navigation && (
          <Button title="Back Home" onPress={() => navigation.goBack()} />
        )}
      </View>
    )
  }
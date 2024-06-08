import {View,Text, Button} from "react-native"
import {styles, HomeScreenProps} from "../App"

export default function ForumScreen({ navigation }: HomeScreenProps) {
    return (
      <View style={styles.container}>
        <Text>Forum goes here</Text>
        {navigation && (
          <Button title="Back Home" onPress={() => navigation.goBack()} />
        )}
      </View>
    )
  }
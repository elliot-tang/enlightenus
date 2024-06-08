import {View,Text, Button} from "react-native"
import {styles, HomeScreenProps} from "../App"

export default function HistScreen({ navigation }: HomeScreenProps) {
    return (
      <View style={styles.container}>
        <Text>A history of recently played quizzes</Text>
        {navigation && (
          <Button title="Back Home" onPress={() => navigation.goBack()} />
        )}
      </View>
    )
  }
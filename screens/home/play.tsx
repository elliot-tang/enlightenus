import {View,Text, Button} from "react-native"
import {styles, HomeScreenProps} from "../../App"

export default function Play({ navigation }: HomeScreenProps) {
    return (
      <View style={styles.buttonContainer}>
        <Text>Select quiz to play</Text>
        {navigation && (
          <Button title="Back Home" onPress={() => navigation.goBack()} />
        )}
      </View>
    )};
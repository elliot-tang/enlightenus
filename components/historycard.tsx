import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { QnProps } from './question1by1';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export type HistoryProps = {
  id: string
  title: string
  topic: string
  questions: Array<QnProps>
  tally: Array<boolean>
  userAnswers: Array<string>
  hasSaved: boolean
} 

// the schema this taken in will be a quiz-user pair that will have quiz id, user id, and tally. Fetch the quiz using the quiz id, the quiz and bring the title and topic over from quiz props to here, quiz can either just store the question prop arrays, OR store a bunch of question id strings that point to individual question props. eitherway, first will need to bundle the question props together, then feed into following. 
//Somehow we need to ask if this quiz has questions saved by the user, and also get that....

type HistoryPropswFunc = HistoryProps & { goToInd: () => void};

export default function HistoryCard(hprops: HistoryPropswFunc) {
  return(<TouchableOpacity style = {styles.touchable} onPress={hprops.goToInd}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{hprops.topic}: {hprops.title} </Text>
    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{hprops.tally.filter(ele=>ele==true).length}/{hprops.tally.length} </Text>
    <View style={{flexDirection:"row-reverse"}}>
    <MaterialIcons name="save" size={22} color= {(hprops.hasSaved? "green":"red")}/>
    </View>
  </TouchableOpacity>)
}


const styles = StyleSheet.create({

  touchable: {
    backgroundColor: '#cdefff',
    padding: 15,
    borderRadius: 10,
  },
});
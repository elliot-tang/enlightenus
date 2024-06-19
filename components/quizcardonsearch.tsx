import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { QnProps } from './question1by1';

export type QuizProps = {
  id: string
  title: string
  topic: string
  questions: Array<QnProps>
  oneByOne: boolean
  authorid: string
} 

type QuizPropsFunc = QuizProps & {onPress:()=>void}

export default function QuizCard(qzprops: QuizPropsFunc) {
  return(<TouchableOpacity style = {styles.touchable} onPress={qzprops.onPress}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{qzprops.topic}: {qzprops.title} </Text>
    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Created by {qzprops.authorid} </Text>
    <View style={{flexDirection:"row-reverse"}}>
    <Text>{qzprops.oneByOne? "Questions one by one": "Questions scroll"}</Text> 
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
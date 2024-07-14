import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { QnProps } from './question1by1';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from 'react';

export type QuestionPropsForHistory = {
  id: string,
  mcq: boolean;
  maxAttempt: number;
  quizstmt: string;
  corrans: Array<string>;
  wrongs: Array<string>;
  noOption: number;
  explainText: string;
  responses: Array<string>
  isCorrect: boolean,
  noAttempts: number
}

interface FetchedQuestionForQuiz {
  _id: string;
  questionBody: string;
  __v: number;
  correctOptions?: string[];
  author: string;
  explainText?: string;
  dateCreated: string;
  questionType: string;
  questionAttempts: number;
  noOptions: number;
  options?: { answer: string, isCorrect?: boolean, _id?: string }[];
}

export type HistoryProps = {
  id: string,
  title: string,
  topic: string,
  questions: Array<QuestionPropsForHistory>,
  score: number,
  hasSaved: boolean
} 

// the schema this taken in will be a quiz-user pair that will have quiz id, user id, and tally. Fetch the quiz using the quiz id, the quiz and bring the title and topic over from quiz props to here, quiz can either just store the question prop arrays, OR store a bunch of question id strings that point to individual question props. eitherway, first will need to bundle the question props together, then feed into following. 
//Somehow we need to ask if this quiz has questions saved by the user, and also get that....

type HistoryPropswFunc = HistoryProps & { goToInd: () => void};

export type HistoryProps2 = {
  id: string,
  title: string,
  topic: string,
  questions: Array<QuestionPropsForHistory>,
  avescore: number,
  numberplays: number
} 

export type HistoryProps3 = {
  id: string,
  title: string,
  topic: string,
  questions: Array<QuestionPropsForHistory>,
  hasSaved: boolean
} 

type HistoryPropswFunc2 = HistoryProps2 & { goToInd: () => void};
type HistoryPropswFunc3 = HistoryProps3 & { goToInd: () => void};

export default function HistoryCard(hprops: HistoryPropswFunc) {
  return(<TouchableOpacity style = {styles.touchable} onPress={hprops.goToInd}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{hprops.topic}: {hprops.title} </Text>
    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{hprops.score}/{hprops.questions.length} </Text>
    <View style={{flexDirection:"row-reverse"}}>
      <MaterialIcons name="save" size={22} color= {(hprops.hasSaved? "green":"red")}/>
    </View>
  </TouchableOpacity>)
}

export function HistoryCard2(hprops: HistoryPropswFunc2) {
  return(<TouchableOpacity style = {styles2.touchable} onPress={hprops.goToInd}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{hprops.topic}: {hprops.title} </Text>
    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Average Score: {hprops.avescore} </Text>
    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Times Played: {hprops.numberplays} </Text>
  </TouchableOpacity>)
}

export function HistoryCard3(hprops: HistoryPropswFunc3) {
  return(<TouchableOpacity style = {styles2.touchable} onPress={hprops.goToInd}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{hprops.topic}: {hprops.title} </Text>
  </TouchableOpacity>)
}

const styles = StyleSheet.create({

  touchable: {
    backgroundColor: '#cdefff',
    padding: 15,
    borderRadius: 10,
  },
});

const styles2 = StyleSheet.create({

  touchable: {
    backgroundColor: '#99ff99',
    padding: 15,
    borderRadius: 10,
  },
});
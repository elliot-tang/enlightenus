import { HomeStackParamList, styles } from '@app/App';
import { quiz1b1 } from '@app/components/question1by1';
import { quizScroll } from '@app/components/questionscroll';
import { returnUser } from '@app/context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Button, Text, Switch } from 'react-native';
import axios from 'axios';

type DisplayProps = NativeStackScreenProps<HomeStackParamList, "DisplayPlay">

type TakenQuestionProps = {
  question: { questionId: string, questionType: string, },
  noAttempts: number,
  responses: Array<string>,
  isCorrect: boolean
}

type TakenQuizProps = {
  username: string,
  quizId: string,
  score: number,
  breakdown: Array<TakenQuestionProps>
}

export default function QuizScreen({ route, navigation }: DisplayProps) {
  const [OneByOne, SetOneByOne] = useState(true);
  const quizparams = (route.params === undefined) ? { id: "", title: "", topic: "", questions: [], oneByOne: false, authorid: "" } : route.params.qzprop;
  const user = returnUser();

  const saveQuiz: () => Promise<string> = async () => {
    try {
      const savedQuiz = {
        username: user,
        quizId: route.params.qzprop.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuiz`, savedQuiz);
      console.log(`Question ID: ${route.params.qzprop.id} saved by User ${user}`);
      return response.data.savedQuizId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <View style={{ padding: 30, gap: 10, backgroundColor: "white", flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center" }}>{quizparams.topic} Quiz: {quizparams.title}</Text>
      <View style={{ justifyContent: "center", alignContent: "center", gap: 10 }}>
        <Text>By: {quizparams.authorid}</Text>
        <Text>No of Questions: {quizparams.questions.length}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Questions appear in separate pages: </Text>
        <Switch value={OneByOne} onValueChange={SetOneByOne}></Switch>
      </View>
      
      <View style={styles.buttonContainer}>
        {OneByOne ? <Button title="Play this Quiz" onPress={() => navigation.navigate("OneScreen", { qzprop: quizparams })} /> : <Button title="Play this Quiz" onPress={() => navigation.navigate("ScrollScreen", { qzprop: quizparams })} />}
        <Button title= "Save this quiz" onPress={async () => {
          // TODO: Check if quiz is already saved first
          const response = await saveQuiz();
          if (response) {
            alert('Quiz successfully saved!');
          }
        }}/>
        <Button title="Choose another Quiz" onPress={() => navigation.goBack()} />
      </View>
    </View>)
}

export function ScrollScreen({ route, navigation }: DisplayProps) {
  const quizparams = (route.params === undefined) ? { id: "", title: "", topic: "", questions: [], oneByOne: false, authorid: "" } : route.params.qzprop

  return (
    quizScroll(quizparams.questions, () => navigation.navigate("HomeTabs"), quizparams.id)
  )
}

export function OneScreen({ route, navigation }: DisplayProps) {
  const quizparams = (route.params === undefined) ? { id: "", title: "", topic: "", questions: [], oneByOne: false, authorid: "" } : route.params.qzprop

  return (
    quiz1b1(quizparams.questions, () => navigation.navigate("HomeTabs"), quizparams.id)
  )
}
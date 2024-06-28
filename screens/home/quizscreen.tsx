import { HomeStackParamList, styles } from '@app/App';
import { quiz1b1 } from '@app/components/question1by1';
import { quizScroll } from '@app/components/questionscroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, SafeAreaView, Image, Switch } from 'react-native';

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
  const quizparams = (route.params === undefined) ? { id: "", title: "", topic: "", questions: [], oneByOne: false, authorid: "" } : route.params.qzprop

  return (
    <View style={{ padding: 20, gap: 10, backgroundColor: "white", flex: 1 }}>
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
        <Button title= "Save this quiz" onPress={()=> alert("Currently Under Development")}/>
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
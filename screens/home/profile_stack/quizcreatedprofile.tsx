import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@app/App';
import CustomPicker from '@app/components/mypicker';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';
import { HistoryCard2 } from '@app/components/historycard';

const { height, width } = Dimensions.get("window");

type ProfileQzCProps = NativeStackScreenProps<HomeStackParamList, "Pquizcreated">

export const QuizCreateScreen = ({ route, navigation }: ProfileQzCProps) => {
  const [quizzes, setQuizzes] = useState([]);
  const [topic, setTopic] = useState("Uncategorised");
  const user = returnUser();

  const filtered = quizzes.filter(quiz => quiz.topic === topic)

  useFocusEffect(
    React.useCallback(() => {
      async function loadQuizzes() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchCreatedQuizzesForAnalytics`, { params: { username: user } });
          const quizzes = response.data.quizzes;
          const data = quizzes.map(quiz => {
            const id = quiz._id;
            const title = quiz.title;
            const topic = quiz.topic;
            const avgScore = quiz.quizStats.avgQuizScore;
            const timesTaken = quiz.timesTaken;
            const questions = quiz.questions.map(qn => {
              const qnNo = quiz.questions.indexOf(qn);
              const id = qn._id;
              const mcq = qn.questionType === 'MCQ';
              const maxAttempt = qn.questionAttempts;
              const quizstmt = qn.questionBody;
              const corrans = mcq ? qn.options.filter(option => option.isCorrect).map(option => option.answer) : qn.correctOptions;
              const wrongs = mcq ? qn.options.filter(option => !option.isCorrect).map(option => option.answer) : [];
              const noOption = qn.noOptions;
              const explainText = qn.explainText;
              const responses = qn.responses;
              const isCorrect = qn.isCorrect;
              const noAttempts = qn.noAttempts;
              const wrongAnswers = quiz.quizStats.wrongAnswers !== null ? quiz.quizStats.wrongAnswers[qnNo] : null;
              const numberCorrect = quiz.quizStats.numberCorrect[qnNo];
              return { id, mcq, maxAttempt, quizstmt, corrans, wrongs, noOption, explainText, responses, isCorrect, noAttempts, wrongAnswers, numberCorrect };
            });
            return { id, title, topic, questions, avgScore, timesTaken };
          });
          setQuizzes(data);
        } catch (error) {
          console.error('Error loading quizzes:', error);
          setQuizzes([]);
        }
      }
      loadQuizzes();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1,  backgroundColor:"white" }}>
      <View style={{ height: height * 0.07 }} />
      <Text style={{ fontSize: 23, fontWeight: "bold" }}>
        View Created Quizzes Here
      </Text>
      <View style={{ zIndex: 1 }}>
        <CustomPicker
          options={Array.from(new Set(quizzes.map(quiz => quiz.topic))).map(topic => {return { value: topic, label: topic }})}
          selectedValue={topic}
          onValueChange={setTopic}
          label="Topic:"
        />
      </View>
      <ScrollView style={{ flex: 1 }}>
        {filtered.map((item) => <View style={{ paddingTop: 10 }}>
          <HistoryCard2
            key={item.id}
            {...item}
            id={item.id} //to do: numberplays should be length of the array whose user-quiz map contains this quiz id, and also the average of scores
            goToInd={() => navigation.navigate("Pquestioncreated", { quizprops: item })} />
        </View>)}
      </ScrollView>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  )
}

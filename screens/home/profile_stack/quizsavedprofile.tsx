import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@app/App';
import CustomPicker from '@app/components/mypicker';
import { StackedBarChart } from 'react-native-svg-charts';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HistoryCard3 } from '@app/components/historycard';

const { height, width } = Dimensions.get("window");

type ProfileQzSProps = NativeStackScreenProps<HomeStackParamList, "Pquizsaved">

export const QuizSavedScreen = ({ route, navigation }: ProfileQzSProps) => {
  const [quizzes, setQuizzes] = useState([]);
  const [toDisplayQuizzes, setToDisplay] = useState([]);
  const [topic, setTopic] = useState("Uncategorised");
  const user = returnUser();

  useFocusEffect(
    React.useCallback(() => {
      async function loadQuizzes() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchSavedQuizzes`, { params: { username: user } });
          const quizzes = response.data.quizzes;
          const data = quizzes.map(quiz => {
            const takenId = quiz.takenId;
            const id = quiz._id;
            const title = quiz.title;
            const topic = quiz.topic;
            const score = quiz.score;
            const questions = quiz.questions.map(qn => {
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
              return { id, mcq, maxAttempt, quizstmt, corrans, wrongs, noOption, explainText, responses, isCorrect, noAttempts };
            });
            return { takenId, id, title, topic, questions, score };
          });
          setQuizzes(data);
          setToDisplay(data);
        } catch (error) {
          console.error('Error loading quizzes:', error);
          setQuizzes([]);
          setToDisplay([]);
        }
      }
      loadQuizzes();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ height: height * 0.07 }} />
      <Text style={{ fontSize: 23, fontWeight: "bold" }}>
        View Saved Quizzes Here
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
        {toDisplayQuizzes.map((item) => <View style={{ paddingTop: 10 }}>
          <HistoryCard3
            hasSaved={false} key={item._id}
            {...item}
            id={item._id}
            goToInd={() => navigation.navigate("Pquestionsaved", { quizprops: item })} />
        </View>)}
      </ScrollView>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  )
}
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@app/App';
import CustomPicker from '@app/components/mypicker';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';
import { HistoryCard3 } from '@app/components/historycard';

const { height, width } = Dimensions.get("window");

type ProfileQzSProps = NativeStackScreenProps<HomeStackParamList, "Pquizsaved">

export const QuizSavedScreen = ({ route, navigation }: ProfileQzSProps) => {
  const [quizzes, setQuizzes] = useState([]);
  const [topic, setTopic] = useState("Uncategorised");
  const user = returnUser();

  const filtered = quizzes.filter(quiz => quiz.topic === topic)

  useFocusEffect(
    React.useCallback(() => {
      async function loadQuizzes() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchSavedQuizzes`, { params: { username: user } });
          const quizzes = response.data.quizzes;
          const data = quizzes.map(quiz => {
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
              return { id, mcq, maxAttempt, quizstmt, corrans, wrongs, noOption, explainText };
            });
            return { id, title, topic, questions, score };
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

  const unsaveQuiz: (quizId: string) => Promise<string> = async (quizId: string) => {
    try {
      const savedQuiz = {
        username: user,
        quizId: quizId
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/unsaveQuiz`, savedQuiz);
      console.log(`Question ID: ${quizId} unsaved by User ${user}`);
      setQuizzes(Array.from(quizzes).filter(quiz => quiz.id !== quizId));
      return response.data.message;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ height: height * 0.07 }} />
      <Text style={{ fontSize: 23, fontWeight: "bold" }}>
        View Saved Quizzes Here
      </Text>
      <View style={{ zIndex: 1 }}>
        <CustomPicker
          options={Array.from(new Set(quizzes.map(quiz => quiz.topic))).map(topic => { return { value: topic, label: topic } })}
          selectedValue={topic}
          onValueChange={setTopic}
          label="Topic:"
        />
      </View>
      <ScrollView style={{ flex: 1 }}>
        {filtered.map((item) => <View style={{ paddingTop: 10 }}>
          <HistoryCard3
            hasSaved={false} key={item.id}
            {...item}
            id={item.id}
            goToInd={() => navigation.navigate("Pquestionsaved", { quizprops: item })}
            unsaveQuiz={() => unsaveQuiz(item.id)}
          />
        </View>)}
      </ScrollView>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  )
}
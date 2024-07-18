import { View, Text, TouchableOpacity, StyleSheet, Pressable, Button } from 'react-native';
import { QnProps } from './question1by1';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from 'react';
import { useState } from 'react';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';
import { QuizPropsForAnalytics } from '@app/screens/home/profile_stack/profile';

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

type HistoryPropswFunc = HistoryProps & { goToInd: () => void };

type QuizCreateScreenAnalyticsProps = QuizPropsForAnalytics & { goToInd: () => void };

export type HistoryProps3 = {
  id: string,
  title: string,
  topic: string,
  questions: Array<QuestionPropsForHistory>,
  hasSaved: boolean
}

type HistoryPropswFunc3 = HistoryProps3 & { goToInd: () => void, unsaveQuiz: () => Promise<string> };

export default function HistoryCard(hprops: HistoryPropswFunc) {
  const [saved, setSaved] = useState<boolean>(hprops.hasSaved);
  const user = returnUser();

  const saveQuiz: () => Promise<string> = async () => {
    try {
      const savedQuiz = {
        username: user,
        quizId: hprops.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuiz`, savedQuiz);
      console.log(`Question ID: ${hprops.id} saved by User ${user}`);
      setSaved(true);
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

  const unsaveQuiz: () => Promise<string> = async () => {
    try {
      const savedQuiz = {
        username: user,
        quizId: hprops.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/unsaveQuiz`, savedQuiz);
      console.log(`Question ID: ${hprops.id} unsaved by User ${user}`);
      setSaved(false);
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
    <TouchableOpacity style={styles.touchable} onPress={hprops.goToInd}>
      <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{hprops.topic}: {hprops.title} </Text>
      <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{hprops.score}/{hprops.questions.length} </Text>
      <View style={{ flexDirection: "row-reverse" }}>
        <Pressable onPress={async () => {
          if (saved) {
            const response = await unsaveQuiz();
            if (response) {
              alert('Quiz unsaved successfully!');
            }
          } else {
            const response = await saveQuiz();
            if (response) {
              alert('Quiz saved successfully!');
            }
          }
        }}>
          <MaterialIcons name="save" size={22} color={(saved ? "green" : "red")} />
        </Pressable>
      </View>
    </TouchableOpacity>
  )
}

export function HistoryCard2(hprops: QuizCreateScreenAnalyticsProps) {
  return (<TouchableOpacity style={styles2.touchable} onPress={hprops.goToInd}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{hprops.topic}: {hprops.title} </Text>
    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Average Score: {Math.round(hprops.avgScore * 100) / 100} out of {hprops.questions.length} </Text>
    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Times Played: {hprops.timesTaken} </Text>
  </TouchableOpacity>)
}

export function HistoryCard3(hprops: HistoryPropswFunc3) {
  return (<TouchableOpacity style={styles2.touchable} onPress={hprops.goToInd}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{hprops.topic}: {hprops.title} </Text>
    <Button title="Unsave" onPress={async () => {
      const response = await hprops.unsaveQuiz();
      if (response) {
        alert('Quiz unsaved successfully!');
      }
    }}
    />
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
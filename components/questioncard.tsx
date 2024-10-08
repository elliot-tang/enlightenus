import React, { useState } from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { QuestionPropsForHistory } from './historycard';
import { returnUser } from '@app/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const { height, width } = Dimensions.get("window")

type QnProps = {
  id: string;
  mcq: boolean;
  maxAttempt: number;
  quizstmt: string;
  corrans: Array<string>; /*allow multiple correct answers*/
  wrongs: Array<string>; /* allow user to put in their own red herrings*/
  noOption: number;
  explainText: string;
};

export type QnPropsDisplay = QnProps & { editQn: () => void, deleteQn: () => void, pushQn: () => void, notpushed: boolean };

export type QnPropsWithReport = QnProps & { saveQn: () => void, unsaveQn: () => void, reportQn: () => void, userAns: string, correct: boolean, saved: boolean };

export const QuestionCard = (question: QnPropsDisplay) => {

  const shorten = question.corrans.slice(0, 3)
  const renderCorrectAnswers = () => {
    return shorten.map((answer) => (
      <Text key={answer} style={styles.correctAnswer}>
        {answer}
      </Text>
    ));
  };

  return (
    <View style={styles.cardContainer}>
      <View style={{ flexDirection: "row", flex: 1 }}>
        <View style={{ flex: 6 }}>
          <Text style={styles.questionStatement}>{question.mcq ? "MCQ" : "Open"}: {question.quizstmt}</Text>
          {renderCorrectAnswers()}
          {(question.corrans.length > 3) && <Text style={styles.correctAnswer}>(And {question.corrans.length - 3} others) </Text>}
          <View style={styles.editIconContainer}>
            <Button title="Edit" onPress={question.editQn} />
            <Button title="Delete" onPress={question.deleteQn} />
          </View>
          <View style={{ paddingTop: 10 }}>
            <TouchableOpacity style={{ flexDirection: "row", flex: 1, justifyContent: "center", alignContent: "center" }} onPress={question.pushQn} disabled={!question.notpushed}>
              <Text style={{ color: question.notpushed ? "black" : "gray" }}>Push question to database</Text>
              <MaterialIcons name="arrow-right" size={24} color={question.notpushed ? "black" : "gray"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export function TallyCard(question: QnPropsWithReport) {
  const shorten = question.corrans.slice(0, 3);
  const user = returnUser();
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      async function getSaved() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/checkSavedQuestion`, { params: { username: user, questionId: question.id } });
          setSaved(response.data.saved);
        } catch (error) {
          console.error('Error fetching saved question:', error);
          setSaved(false);
        }
      }
      getSaved();
    }, [])
  );

  const renderCorrectAnswers = () => {
    return shorten.map((answer) => (
      <Text key={answer} style={styles.correctAnswer}>
        {answer}
      </Text>
    ));
  };

  const saveQuestion = async () => {
    try {
      const savedQuestion = {
        username: user,
        questionId: question.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuestion`, savedQuestion);
      console.log(`Question ID: ${question.id} saved by User ${user}`);
      setSaved(true);
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

  const unsaveQuestion = async () => {
    try {
      const savedQuestion = {
        username: user,
        questionId: question.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/unsaveQuestion`, savedQuestion);
      console.log(`Question ID: ${question.id} unsaved by User ${user}`);
      setSaved(false);
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
    <View style={{ gap: 10, borderRadius: 10, backgroundColor: '#cdefff', borderWidth: 3 }}>
      <Text style={styles.questionStatement}>
        {question.mcq ? 'MCQ' : 'Open'}: {question.quizstmt}
      </Text>
      {renderCorrectAnswers()}
      {question.corrans.length > 3 && <Text style={styles.correctAnswer}>(And {question.corrans.length - 3} others) </Text>}
      <Text style={{ color: question.correct ? 'green' : 'red', }}>Your answer: {question.userAns}</Text>
      <View style={styles.editIconContainer}>
        <Button title="Report" onPress={question.reportQn} />
        {saved ? (
          <Button color="red" title="Remove" onPress={unsaveQuestion} />
        ) : (
          <Button title="Save" onPress={saveQuestion} />
        )}
      </View>
    </View>
  );
}

type HistoryTallyCardProps = QuestionPropsForHistory & { reportQn: () => void }

export function HistoryTallyCard(question: HistoryTallyCardProps) {
  const shorten = question.corrans.slice(0, 3);
  const user = returnUser();
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      async function getSaved() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/checkSavedQuestion`, { params: { username: user, questionId: question.id } });
          setSaved(response.data.saved);
        } catch (error) {
          console.error('Error fetching saved question:', error);
          setSaved(false);
        }
      }
      getSaved();
    }, [])
  );

  const renderCorrectAnswers = () => {
    return shorten.map((answer) => (
      <Text key={answer} style={styles.correctAnswer}>
        {answer}
      </Text>
    ));
  };

  const renderUserAnswers = () => {
    return '[' + question.responses.toString() + ']';
  };

  const saveQuestion = async () => {
    try {
      const savedQuestion = {
        username: user,
        questionId: question.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuestion`, savedQuestion);
      console.log(`Question ID: ${question.id} saved by User ${user}`);
      setSaved(true);
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

  const unsaveQuestion = async () => {
    try {
      const savedQuestion = {
        username: user,
        questionId: question.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/unsaveQuestion`, savedQuestion);
      console.log(`Question ID: ${question.id} unsaved by User ${user}`);
      setSaved(false);
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
    <View style={{ gap: 10, borderRadius: 10, backgroundColor: '#cdefff', borderWidth: 3 }}>
      <Text style={styles.questionStatement}>
        {question.mcq ? 'MCQ' : 'Open'}: {question.quizstmt}
      </Text>
      {renderCorrectAnswers()}
      {question.corrans.length > 3 && <Text style={styles.correctAnswer}>(And {question.corrans.length - 3} others) </Text>}
      <Text style={{ color: question.isCorrect ? 'green' : 'red', }}>Your answer(s): {renderUserAnswers()}</Text>
      {question.explainText != undefined && <Text>Explanation: {question.explainText}</Text>}
      <View style={styles.editIconContainer}>
        <Button title="Report" onPress={question.reportQn} />
        {saved ? (
          <Button color="red" title="Remove" onPress={unsaveQuestion} />
        ) : (
          <Button title="Save" onPress={saveQuestion} />
        )}
      </View>
    </View>
  );
}

export function SavedAnalyticsTallyCard(question: QnProps) {
  const shorten = question.corrans.slice(0, 3);
  const user = returnUser();
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      async function getSaved() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/checkSavedQuestion`, { params: { username: user, questionId: question.id } });
          setSaved(response.data.saved);
        } catch (error) {
          console.error('Error fetching saved question:', error);
          setSaved(false);
        }
      }
      getSaved();
    }, [])
  );

  const renderCorrectAnswers = () => {
    return shorten.map((answer) => (
      <Text key={answer} style={styles.correctAnswer}>
        {answer}
      </Text>
    ));
  };

  const saveQuestion = async () => {
    try {
      const savedQuestion = {
        username: user,
        questionId: question.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuestion`, savedQuestion);
      console.log(`Question ID: ${question.id} saved by User ${user}`);
      setSaved(true);
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

  const unsaveQuestion = async () => {
    try {
      const savedQuestion = {
        username: user,
        questionId: question.id,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/unsaveQuestion`, savedQuestion);
      console.log(`Question ID: ${question.id} unsaved by User ${user}`);
      setSaved(false);
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
    <View style={{ gap: 10, borderRadius: 10, backgroundColor: '#cdefff', borderWidth: 3 }}>
      <Text style={styles.questionStatement}>
        {question.mcq ? 'MCQ' : 'Open'}: {question.quizstmt}
      </Text>
      {renderCorrectAnswers()}
      {question.corrans.length > 3 && <Text style={styles.correctAnswer}>(And {question.corrans.length - 3} others) </Text>}
      {question.explainText != undefined && <Text>Explanation: {question.explainText}</Text>}
      <View style={styles.editIconContainer}>
        {saved ? (
          <Button color="red" title="Remove" onPress={unsaveQuestion} />
        ) : (
          <Button title="Save" onPress={saveQuestion} />
        )}
      </View>
    </View>
  );
}



type QuestionPropsForTaken = QuestionPropsForHistory & { mostCommonWrong: { responses: Array<string>, count: number }, percentageRight: number }

export function HistoryTallyCard2(question: QuestionPropsForTaken) {

  return (
    <View style={{ gap: 10, borderRadius: 10, backgroundColor: '#99ff99', borderWidth: 3 }}>
      <Text style={styles.questionStatement}>
        {question.mcq ? 'MCQ' : 'Open'}: {question.quizstmt}
      </Text>
      <Text>Correct answers: {question.corrans.toString()}</Text>
      {question.corrans.length > 3 && <Text style={styles.correctAnswer}>(And {question.corrans.length - 3} others) </Text>}
      {(question.mostCommonWrong !== null && !isNaN(question.percentageRight)) && (question.mostCommonWrong.responses ? <Text style={{ color: "red" }}>The most common wrong answer was: {question.mostCommonWrong.responses.toString()}</Text> : <Text style={{ color: "#013220" }}>Everyone got your question right!</Text>)}
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        {/* <View style={{borderBottomLeftRadius:3, borderTopLeftRadius:3, height: 10, width: width*0.5*question.percentageRight, backgroundColor:"#52CA05"}}/> */}
        {!isNaN(question.percentageRight)? <Text>{Math.round(question.percentageRight * 10000) / 100}% correct</Text>: <Text>No one has taken the quiz yet.</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#cdefff'
  },
  questionStatement: {
    fontSize: 16,
    marginBottom: 5,
  },
  correctAnswer: {
    color: 'green',
  },
  editIconContainer: {
    flexDirection: 'row-reverse',
    gap: 10 // Align edit button to the right
  },
  editButton: {
    padding: 5,
  },
});
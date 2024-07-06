import React, { useState } from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { QuestionPropsForHistory } from './historycard';
import { returnUser } from '@app/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

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

export type QnPropsDisplay = QnProps & { editQn: () => void , deleteQn:() =>void, pushQn:()=>void, notpushed: boolean};

export type QnPropsWithReport = QnProps & { saveQn: ()=> void, unsaveQn: ()=> void, reportQn: () => void , userAns: string, correct: boolean, saved: boolean};

export const QuestionCard = (question: QnPropsDisplay) => {

  const shorten = question.corrans.slice(0,3)
  const renderCorrectAnswers = () => {
    return shorten.map((answer) => (
      <Text key={answer} style={styles.correctAnswer}>
        {answer}
      </Text>
    ));
  };

  return (
    <View style={styles.cardContainer}>
    <View style={{flexDirection:"row", flex:1}}>
      <View style ={{flex:6}}>
      <Text style={styles.questionStatement}>{question.mcq? "MCQ":"Open"}: {question.quizstmt}</Text>
      {renderCorrectAnswers()}
      {(question.corrans.length > 3) && <Text style={styles.correctAnswer}>(And {question.corrans.length-3} others) </Text>}
      <View style={styles.editIconContainer}>
        <Button title="Edit" onPress={question.editQn} />
        <Button title="Delete" onPress={question.deleteQn} />
      </View>
      <View style={{paddingTop:10}}>
      <TouchableOpacity  style ={{flexDirection:"row",flex:1, justifyContent:"center", alignContent:"center"}} onPress={question.pushQn} disabled={!question.notpushed}>
          <Text style ={{color :question.notpushed? "black":"gray"}}>Push question to database</Text>
        <MaterialIcons name="arrow-right" size={24} color = {question.notpushed? "black":"gray"} />
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

  const renderCorrectAnswers = () => {
    return shorten.map((answer) => (
      <Text key={answer} style={styles.correctAnswer}>
        {answer}
      </Text>
    ));
  };

  const reportQuestion = () => alert('Currently under development!');

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
      console.error('Error saving questions', error);
      alert('Error saving questions');
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
      console.error('Error unsaving questions', error);
      alert('Error unsaving questions');
    }
  };

  return (
    <View style={{ gap: 10, borderRadius: 10, backgroundColor: '#cdefff', borderWidth: 3 }}>
      <Text style={styles.questionStatement}>
        {question.mcq ? 'MCQ' : 'Open'}: {question.quizstmt}
      </Text>
      {renderCorrectAnswers()}
      {question.corrans.length > 3 && <Text style={styles.correctAnswer}>(And {question.corrans.length - 3} others) </Text>}
      <Text style={{color: question.correct ? 'green' : 'red',}}>Your answer: {question.userAns}</Text>
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

export function HistoryTallyCard(question: QuestionPropsForHistory) {
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

  const reportQuestion = () => alert('Currently under development!');

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
      console.error('Error saving questions', error);
      alert('Error saving questions');
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
      console.error('Error unsaving questions', error);
      alert('Error unsaving questions');
    }
  };

  return (
    <View style={{ gap: 10, borderRadius: 10, backgroundColor: '#cdefff', borderWidth: 3 }}>
      <Text style={styles.questionStatement}>
        {question.mcq ? 'MCQ' : 'Open'}: {question.quizstmt}
      </Text>
      {renderCorrectAnswers()}
      {question.corrans.length > 3 && <Text style={styles.correctAnswer}>(And {question.corrans.length - 3} others) </Text>}
      <Text style={{color: question.isCorrect ? 'green' : 'red',}}>Your answer(s): {renderUserAnswers()}</Text>
      <View style={styles.editIconContainer}>
        <Button title="Report" onPress={reportQuestion} />
        {saved ? (
          <Button color="red" title="Remove" onPress={unsaveQuestion} />
        ) : (
          <Button title="Save" onPress={saveQuestion} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    backgroundColor:'#cdefff'
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
    gap : 10 // Align edit button to the right
  },
  editButton: {
    padding: 5,
  },
});
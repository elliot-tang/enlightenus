import * as React from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { QuestionPropsForHistory } from './historycard';

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

export type HistoryQnPropsWithReport = QuestionPropsForHistory & { saveQn: ()=> void, unsaveQn: ()=> void, reportQn: () => void , saved: boolean};

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

  const renderCorrectAnswers = () => {
    return shorten.map((answer) => (
      <Text key={answer} style={styles.correctAnswer}>
        {answer}
      </Text>
    ));
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
        {question.saved ? (
          <Button color="red" title="Remove" onPress={question.unsaveQn} />
        ) : (
          <Button title="Save" onPress={question.saveQn} />
        )}
      </View>
    </View>
  );
}

export function HistoryTallyCard(question: HistoryQnPropsWithReport) {
  const shorten = question.corrans.slice(0, 3);

  const renderCorrectAnswers = () => {
    return shorten.map((answer) => (
      <Text key={answer} style={styles.correctAnswer}>
        {answer}
      </Text>
    ));
  };

  const renderUserAnswers = () => {
    return '[' + question.responses.toString() + ']';
  }

  return (
    <View style={{ gap: 10, borderRadius: 10, backgroundColor: '#cdefff', borderWidth: 3 }}>
      <Text style={styles.questionStatement}>
        {question.mcq ? 'MCQ' : 'Open'}: {question.quizstmt}
      </Text>
      {renderCorrectAnswers()}
      {question.corrans.length > 3 && <Text style={styles.correctAnswer}>(And {question.corrans.length - 3} others) </Text>}
      <Text style={{color: question.isCorrect ? 'green' : 'red',}}>Your answer(s): {renderUserAnswers()}</Text>
      <View style={styles.editIconContainer}>
        <Button title="Report" onPress={question.reportQn} />
        {question.saved ? (
          <Button color="red" title="Remove" onPress={question.unsaveQn} />
        ) : (
          <Button title="Save" onPress={question.saveQn} />
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
import * as React from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput } from 'react-native';

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

export type QnPropsDisplay = QnProps & { editQn: () => void , deleteQn:() =>void};

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
      <Text style={styles.questionStatement}>{question.mcq? "MCQ":"Open"}: {question.quizstmt}</Text>
      {renderCorrectAnswers()}
      {(question.corrans.length > 3) && <Text style={styles.correctAnswer}>(And {question.corrans.length-3} others) </Text>}
      <View style={styles.editIconContainer}>
        <Button title="Edit" onPress={question.editQn} />
        <Button title="Delete" onPress={question.deleteQn} />
      </View>
    </View>
  );
};

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
import React, { useState } from 'react';
import { Button, Text, TextInput, View, FlatList, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { TallyCard } from './questioncard';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';

export type QnProps = {
  id: string
  mcq: boolean
  maxAttempt: number
  quizstmt: string
  corrans: Array<string> /*allow multiple correct answers*/
  wrongs: Array<string> /* allow user to put in their own red herrings*/
  noOption: number
  explainText: string
};

export type QnPropsFuncs = QnProps & { updateFunc: (str: string) => void, enumerate: number };

/*TO DO: progressbar that updates based on whether a question is attempted*/

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

export function QnScroll(props: QnPropsFuncs) {
  if (props.mcq == false) {
    const [ansState, setAns] = useState("");
    return (
      <View style={{ borderRadius: 10, borderColor: "black", borderWidth: 2, backgroundColor: "#CAE1CB" }}>
        <Text style={{ fontSize: 20 }}>Q{props.enumerate}: {props.quizstmt}</Text>
        <View style={{ height: 15 }} />
        <TextInput
          style={{
            height: 40,
            borderColor: 'green',
            borderWidth: 1,
            backgroundColor: "white",
            borderRadius: 10
          }}
          placeholder="Type Answer Here"
          onChangeText={text => { setAns(text); props.updateFunc(text) }}
          value={ansState}
        />
      </View>
    );
  }

  else {
    const [ansState, setAns] = useState("");
    const [randomiser, setRan] = useState(true);
    const [optState, setOpt] = useState(Array<string>);
    const [seed, setSeed] = useState(0);
    var temp = Array.from(props.wrongs) /*this function permutes the array of wrong answers */
    function fYS(arr: Array<string>) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr;
    }

    if (randomiser == true) {
      const seed = Math.floor(Math.random() * props.corrans.length);
      setSeed(seed);
      temp = fYS(temp);
      if (props.noOption > temp.length) {
        temp.push(props.corrans[seed]);
        temp = fYS(temp)
      }
      else {
        temp[Math.floor(Math.random() * (props.noOption))] = props.corrans[seed];
      }
      const options: string[] = temp.slice(0, Math.min(props.noOption));
      setOpt(options);
      setRan(false)
    }
    /*the block above is so that once the question is initialised/displayed, we permute only once
    and not every time the user interacts with the options 
    (there is probs a better way to do this.....)*/


    type ItemProps = {
      item: string;
      onPress: () => void;
      backgroundColor: string;
      textColor: string;
    };
    const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => (
      <TouchableOpacity onPress={onPress} style={{ backgroundColor, borderRadius: 10 }}>
        <Text style={{ color: textColor, textAlign: 'center', fontSize: 15 }}>{item}</Text>
      </TouchableOpacity>
    );

    const renderOps = ({ item }: { item: string }) => {
      const backgroundColor = (item === ansState ? '#2d93e4' : '#d4f1f6');
      const color = (item === ansState ? 'white' : 'black'); /*can decide on a different style later; */

      return (
        <Item
          item={item}
          onPress={() => { setAns(item); props.updateFunc(item) }}
          backgroundColor={backgroundColor}
          textColor={color}
        />
      );
    };

    return (
      <View style={{ borderRadius: 10, borderColor: "black", borderWidth: 2, backgroundColor: "#CAE1CB" }}>
        <Text style={{ fontSize: 20 }}>Q{props.enumerate}: {props.quizstmt}</Text>
        <View style={{ height: 15 }} />
        <FlatList
          data={optState}
          renderItem={renderOps}
          extraData={ansState}
          ItemSeparatorComponent={
            (() => (
              <View
                style={{ height: 7 }}
              />
            ))
          }
        />
      </View>
    )

  }
}
export type QnPropsVerify = QnProps & { ans: string }
export function AnsScroll(props: QnPropsVerify) {
  if (props.explainText) {
    return (
      <Text style={{ fontWeight: "bold" }} >Explanation: {props.explainText}</Text>
    )
  }
}

/*above defines a modified version of question component, below initialises a quiz component based on QnProps data */

export function quizScroll(questions: Array<QnProps>, exitScreen: () => void, quizId: string) {
  const totalQn = questions.length;
  const [subState, setSub] = useState(false);
  const [qAnswers, setqAns] = useState(Array(totalQn));
  const [save, setSave] = useState(Array<string>);
  const [reportstring, setReportstring] = useState("");
  const [currentReportQn, setCurrentQ] = useState("");
  const [currentReportid, setCurrentI] = useState("");
  const [pageNo, setPage] = useState(0);
  const [score, setScore] = useState(0);
  const [isCorrects, setIsCorrects] = useState(Array<boolean>(totalQn));
  const [noAttempts, setNoAttempts] = useState(Array<number>(totalQn)); // currently not tracked ???
  const user = returnUser();
  /*function callBack*/
  function updateAns(qst: QnProps) {
    return function (answer: string) {
      const index = questions.indexOf(qst);
      var temp = Array.from(qAnswers);
      temp[index] = answer;
      setqAns(temp);
      setSub(false);
    }
  }

  const saveQuiz: () => Promise<string> = async () => {
    try {
      const savedQuiz = {
        username: user,
        quizId: quizId,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuiz`, savedQuiz);
      console.log(`Question ID: ${quizId} saved by User ${user}`);
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

  const reportQuestion: () => Promise<string> = async () => {
    try {
      if (reportstring.trim() === '') {
        alert('Please provide a report reason!');
        setReportstring('');
      } else {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/report/reportQuestion`, { username: user, questionId: currentReportid, reportReason: reportstring });
        return response.data.reportId;
      }
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

  if (pageNo === 0) {
    if (subState == false || qAnswers.includes(undefined)) {
      return (
        <SafeAreaView style={{ paddingTop: 30 }}>
          <ScrollView>
            <FlatList
              ItemSeparatorComponent={
                (() => (
                  <View
                    style={{ height: 16 }}
                  />
                ))
              }
              data={questions}
              renderItem={({ item }) => <QnScroll
                id={item.id}
                mcq={item.mcq}
                maxAttempt={item.maxAttempt}
                quizstmt={item.quizstmt}
                corrans={item.corrans}
                wrongs={item.wrongs}
                noOption={item.noOption}
                explainText={item.explainText}
                enumerate={questions.indexOf(item) + 1}
                updateFunc={updateAns(item)} />}

            />
            <Button
              title="Submit All"
              onPress={async () => {
                // Determines score and tracks whether user got the question right or wrong
                try {
                  var tmpScore = 0;
                  var tmpIsCorrects = Array(questions.length).fill(false);
                  for (var i = 0; i < questions.length; i++) {
                    if (questions[i].corrans.includes(qAnswers[i])) {
                      tmpScore += 1;
                      tmpIsCorrects[i] = true;
                    };
                  }
                  setScore(tmpScore);
                  setIsCorrects(tmpIsCorrects);

                  // Saves the taken quiz and user response into the database
                  var breakdown: Array<TakenQuestionProps> = [];
                  for (var i = 0; i < questions.length; i++) {
                    const qn = {
                      question: {
                        questionId: questions[i].id,
                        questionType: questions[i].mcq ? 'MCQ' : 'OEQ'
                      },
                      noAttempts: questions[i].maxAttempt, // TODO implement no of attempts, for now just the max number of attempts
                      responses: [qAnswers[i]],
                      isCorrect: tmpIsCorrects[i]
                    }
                    breakdown.push(qn);
                  }

                  console.log(tmpScore);
                  const TakenQuiz: TakenQuizProps = {
                    username: user,
                    quizId: quizId,
                    score: tmpScore,
                    breakdown: breakdown
                  }

                  const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/takeQuiz`, TakenQuiz);
                  console.log(`Quiz taken! TakenQuiz ID: ${response}`);
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
                } finally {
                  setSub(true);
                }
              }}
              disabled={qAnswers.includes(undefined)} /*dont allow submit when not all qn attempted*/
            />
          </ScrollView>
        </SafeAreaView>
      )
    }
    else {
      const toShow = Array.from({ length: questions.length }, (_, i) => [questions[i], isCorrects[i], qAnswers[i]])

      /*here we display the score, and tally up which qn is correct or wrong*/
      return (
        <SafeAreaView style={{ flex: 1, gap: 10, paddingTop: 30, backgroundColor:"white" }}>
          <View>
            <Text style={{ fontSize: 18 }}>Your score is {score}/{questions.length}. Listed below is a breakdown.</Text>
          </View>
          <View>
            <ScrollView>
              {toShow.map((item) => <View style={{ paddingTop: 10 }}>
                <TallyCard
                  key={item[0].id}
                  {...item[0]}
                  saved={save.includes(item[0].id)}
                  correct={item[1]}
                  userAns={item[2]}
                  reportQn={() => {
                    setCurrentI(item[0].id);
                    setCurrentQ(item[0].quizstmt)
                    setPage(-1);
                  }}
                />
                <AnsScroll
                  {...item[0]}
                />
              </View>)}
              <View style={{ flex: 1, gap: 10 }}>
                <Button title="Return to Home" onPress={() => {
                  // Resets score and isCorrects and returns to home page
                  setScore(0);
                  setIsCorrects([]);
                  exitScreen();
                }} />
                <Button title="Save this quiz" onPress={async () => {
                  const response = await saveQuiz();
                  if (response) {
                    alert('Quiz successfully saved!');
                  }
                }} />
              </View>
              <View style={{ height: 45 }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      )
    }
  }

  else {
    return (
      <View style={{ gap: 5, paddingTop: 30 }}>
        <Text style={{ textAlign: "left" }}>Report Question: {currentReportQn} </Text>
        <TextInput
          style={{
            height: 50,
            paddingHorizontal: 20,
            borderColor: "green",
            borderWidth: 1,
            borderRadius: 7
          }}
          multiline={true}
          placeholder="Enter Text Here..."
          onChangeText={setReportstring}
          value={reportstring}
        />
        <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
          <Button title="Submit" onPress={async () => {
            const response = await reportQuestion();
            if (response) {
              alert(`Question successfully reported! Report ID: ${response}`);
              setReportstring('');
              setCurrentQ('');
              setCurrentI('');
              setPage(0);
            }
          }} />
        </View>
        <View style={{ height: 10 }} />
        <View>
          <Text> Note for reports, please follow the general guidelines for what is reportable content.</Text>
        </View>
        <Button title="Go Back" onPress={() => {
          setReportstring('');
          setCurrentQ('');
          setCurrentI('');
          setPage(0);
        }}></Button>
      </View>
    )
  }

}